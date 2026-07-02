const express = require("express");
const router = express.Router();

const { ReportCard, validate } = require("../models/reportCard");
const { User } = require("../models/user");
const { Class } = require("../models/class");
const { Result } = require("../models/result");
const { Attendance } = require("../models/attendance");
const { HomeworkSubmission } = require("../models/homeworkSubmission");

function calculateGrade(percentage) {
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "E";
}

// GENERATE REPORT CARD
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

  if (results.length === 0) {
    return res.status(400).send("No results found for this student, class and term.");
  }

  const subjectGroups = {};

  results.forEach((result) => {
    const subjectId = result.subject.toString();

    if (!subjectGroups[subjectId]) {
      subjectGroups[subjectId] = {
        subject: result.subject,
        score: 0,
        totalMarks: 0,
        teacherComment: result.teacherComment,
      };
    }

    subjectGroups[subjectId].score += result.score;
    subjectGroups[subjectId].totalMarks += result.totalMarks;
  });

  const subjects = [];
  let totalPercentage = 0;

  for (const subjectId in subjectGroups) {
    const item = subjectGroups[subjectId];
    const percentage = Math.round((item.score / item.totalMarks) * 100);

    subjects.push({
      subject: item.subject,
      score: item.score,
      totalMarks: item.totalMarks,
      percentage,
      grade: calculateGrade(percentage),
      teacherComment: item.teacherComment,
    });

    totalPercentage += percentage;
  }

  const overallAverage = Math.round(totalPercentage / subjects.length);
  const overallGrade = calculateGrade(overallAverage);

  const attendanceRecords = await Attendance.find({
    student: req.body.student,
    class: req.body.class,
  });

  const presentDays = attendanceRecords.filter(
    (item) => item.status === "PRESENT" || item.status === "LATE"
  ).length;

  const attendanceRate =
    attendanceRecords.length > 0
      ? Math.round((presentDays / attendanceRecords.length) * 100)
      : 0;

  const homeworkRecords = await HomeworkSubmission.find({
    student: req.body.student,
  });

  const completedHomework = homeworkRecords.filter(
    (item) =>
      item.status === "SUBMITTED" ||
      item.status === "MARKED" ||
      item.status === "LATE"
  ).length;

  const homeworkCompletionRate =
    homeworkRecords.length > 0
      ? Math.round((completedHomework / homeworkRecords.length) * 100)
      : 0;

  const reportCard = await ReportCard.findOneAndUpdate(
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
      subjects,
      overallAverage,
      overallGrade,
      attendanceRate,
      homeworkCompletionRate,
      classTeacherComment: req.body.classTeacherComment,
      headComment: req.body.headComment,
      status: req.body.status || "DRAFT",
    },
    { new: true, upsert: true }
  );

  res.send(reportCard);
});

// GET ALL REPORT CARDS
router.get("/", async (req, res) => {
  const reports = await ReportCard.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects.subject", "name code level category")
    .sort("-createdAt");

  res.send(reports);
});

// GET REPORT CARDS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const reports = await ReportCard.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects.subject", "name code level category")
    .sort("-createdAt");

  res.send(reports);
});

// GET PUBLISHED REPORT CARDS FOR PARENT/STUDENT VIEW
router.get("/student/:studentId/published", async (req, res) => {
  const reports = await ReportCard.find({
    student: req.params.studentId,
    status: "PUBLISHED",
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects.subject", "name code level category")
    .sort("-createdAt");

  res.send(reports);
});

// GET SINGLE REPORT CARD
router.get("/:id", async (req, res) => {
  const report = await ReportCard.findById(req.params.id)
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects.subject", "name code level category");

  if (!report) return res.status(404).send("Report card not found.");

  res.send(report);
});

// UPDATE REPORT CARD COMMENTS / STATUS
router.put("/:id", async (req, res) => {
  const report = await ReportCard.findByIdAndUpdate(
    req.params.id,
    {
      classTeacherComment: req.body.classTeacherComment,
      headComment: req.body.headComment,
      status: req.body.status,
    },
    { new: true }
  );

  if (!report) return res.status(404).send("Report card not found.");

  res.send(report);
});

// DELETE REPORT CARD
router.delete("/:id", async (req, res) => {
  const report = await ReportCard.findByIdAndDelete(req.params.id);

  if (!report) return res.status(404).send("Report card not found.");

  res.send(report);
});

module.exports = router;