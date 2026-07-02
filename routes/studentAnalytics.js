const express = require("express");
const router = express.Router();

const {
  StudentAnalytics,
  validate,
} = require("../models/studentAnalytic");

const { User } = require("../models/user");
const { Class } = require("../models/class");
const { Result } = require("../models/result");
const { Attendance } = require("../models/attendance");
const { HomeworkSubmission } = require("../models/homeworkSubmission");
const { Subject } = require("../models/subject");

function calculateGrade(average) {
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "E";
}

function calculateStatus(average) {
  if (average >= 80) return "EXCELLENT";
  if (average >= 70) return "GOOD";
  if (average >= 60) return "AVERAGE";
  if (average >= 50) return "WEAK";
  return "CRITICAL";
}

function generateRecommendation(overallAverage, attendanceRate, homeworkRate) {
  if (overallAverage < 50) {
    return "Student needs urgent academic support and extra revision.";
  }

  if (attendanceRate < 75) {
    return "Student attendance is low. Parent and teacher follow-up is recommended.";
  }

  if (homeworkRate < 70) {
    return "Student should improve homework submission and completion.";
  }

  if (overallAverage >= 80) {
    return "Excellent performance. Student should continue with advanced practice.";
  }

  return "Student performance is fair. Continue regular revision and practice.";
}

// GENERATE STUDENT ANALYTICS
router.post("/generate", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const results = await Result.find({
    student: req.body.student,
    class: req.body.class,
    term: req.body.term,
  });

  const attendances = await Attendance.find({
    student: req.body.student,
    class: req.body.class,
  });

  const homework = await HomeworkSubmission.find({
    student: req.body.student,
  });

  const presentDays = attendances.filter(
    (item) => item.status === "PRESENT" || item.status === "LATE"
  ).length;

  const attendanceRate =
    attendances.length > 0
      ? Math.round((presentDays / attendances.length) * 100)
      : 0;

  const completedHomework = homework.filter(
    (item) =>
      item.status === "SUBMITTED" ||
      item.status === "MARKED" ||
      item.status === "LATE"
  ).length;

  const homeworkCompletionRate =
    homework.length > 0
      ? Math.round((completedHomework / homework.length) * 100)
      : 0;

  const subjectGroups = {};

  results.forEach((result) => {
    const subjectId = result.subject.toString();
    const percentage = (result.score / result.totalMarks) * 100;

    if (!subjectGroups[subjectId]) {
      subjectGroups[subjectId] = [];
    }

    subjectGroups[subjectId].push({
      percentage,
      teacherComment: result.teacherComment,
    });
  });

  const subjectPerformances = [];
  const weakSubjects = [];
  const strongSubjects = [];
  let totalAverage = 0;
  let subjectCount = 0;

  for (const subjectId in subjectGroups) {
    const scores = subjectGroups[subjectId].map((item) => item.percentage);

    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    const subjectPerformance = {
      subject: subjectId,
      averageScore: Math.round(averageScore),
      totalTests: scores.length,
      highestScore: Math.round(highestScore),
      lowestScore: Math.round(lowestScore),
      grade: calculateGrade(averageScore),
      teacherComment: subjectGroups[subjectId][0].teacherComment,
    };

    subjectPerformances.push(subjectPerformance);

    if (averageScore < 50) weakSubjects.push(subjectId);
    if (averageScore >= 75) strongSubjects.push(subjectId);

    totalAverage += averageScore;
    subjectCount++;
  }

  const overallAverage =
    subjectCount > 0 ? Math.round(totalAverage / subjectCount) : 0;

  const analytics = await StudentAnalytics.findOneAndUpdate(
    {
      student: req.body.student,
      class: req.body.class,
      term: req.body.term,
      year: req.body.year,
    },
    {
      student: req.body.student,
      class: req.body.class,
      term: req.body.term,
      year: req.body.year,
      attendanceRate,
      homeworkCompletionRate,
      overallAverage,
      overallGrade: calculateGrade(overallAverage),
      performanceStatus: calculateStatus(overallAverage),
      subjectPerformances,
      weakSubjects,
      strongSubjects,
      recommendation: generateRecommendation(
        overallAverage,
        attendanceRate,
        homeworkCompletionRate
      ),
    },
    { new: true, upsert: true }
  );

  res.send(analytics);
});

// GET ALL ANALYTICS
router.get("/", async (req, res) => {
  const analytics = await StudentAnalytics.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .populate("weakSubjects", "name code")
    .populate("strongSubjects", "name code")
    .sort("-createdAt");

  res.send(analytics);
});

// GET ANALYTICS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const analytics = await StudentAnalytics.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .populate("weakSubjects", "name code")
    .populate("strongSubjects", "name code")
    .sort("-createdAt");

  res.send(analytics);
});

// GET SINGLE ANALYTICS RECORD
router.get("/:id", async (req, res) => {
  const analytics = await StudentAnalytics.findById(req.params.id)
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .populate("weakSubjects", "name code")
    .populate("strongSubjects", "name code");

  if (!analytics) {
    return res.status(404).send("Student analytics not found.");
  }

  res.send(analytics);
});

// DELETE ANALYTICS
router.delete("/:id", async (req, res) => {
  const analytics = await StudentAnalytics.findByIdAndDelete(req.params.id);

  if (!analytics) {
    return res.status(404).send("Student analytics not found.");
  }

  res.send(analytics);
});

module.exports = router;