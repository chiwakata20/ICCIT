const express = require("express");
const router = express.Router();

const { User } = require("../models/user");
const { StudentProfile } = require("../models/studentProfile");
const { RevisionTask } = require("../models/revisionTask");
const { WeakTopic } = require("../models/weakTopic");
const { ExamCountdown } = require("../models/examCountdown");
const { StudentAnalytics } = require("../models/studentAnalytic");
const { StudentBadge } = require("../models/studentBadge");

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getPredictedGrade(average) {
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "E";
}

function addCountdown(exam) {
  const today = new Date();
  const examDate = new Date(exam.examDate);

  today.setHours(0, 0, 0, 0);
  examDate.setHours(0, 0, 0, 0);

  const diffTime = examDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    ...exam.toObject(),
    daysRemaining,
    countdownText:
      daysRemaining > 0
        ? `${daysRemaining} days remaining`
        : daysRemaining === 0
        ? "Exam is today"
        : "Exam date has passed",
  };
}

// GET STUDENT PROFILE DASHBOARD
router.get("/:studentId", async (req, res) => {
  const student = await User.findById(req.params.studentId).select("-password");
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const profile = await StudentProfile.findOne({
    user: req.params.studentId,
  })
    .populate("user", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects", "name code level category")
    .populate("parent", "name email role");

  if (!profile) return res.status(404).send("Student profile not found.");

  const { start, end } = getTodayRange();

  const todayRevisionTasks = await RevisionTask.find({
    student: req.params.studentId,
    taskDate: { $gte: start, $lte: end },
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("quiz", "title")
    .populate("libraryResource", "title resourceType")
    .sort("priority createdAt");

  const weakTopicReports = await WeakTopic.find({
    student: req.params.studentId,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt")
    .limit(5);

  const upcomingExams = await ExamCountdown.find({
    class: profile.class._id,
    examDate: { $gte: start },
    status: "PUBLISHED",
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("examDate")
    .limit(5);

  const latestAnalytics = await StudentAnalytics.findOne({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .populate("weakSubjects", "name code")
    .populate("strongSubjects", "name code")
    .sort("-createdAt");

  const badgesEarned = await StudentBadge.find({
    student: req.params.studentId,
  })
    .populate("badge", "name description badgeType iconUrl")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("awardedBy", "name email role")
    .sort("-createdAt");

  const averageScore = latestAnalytics ? latestAnalytics.overallAverage : 0;

  res.send({
    student: {
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
    },

    profile,

    subjectsEnrolled: profile.subjects,

    todayRevisionTasks,

    weakTopics: weakTopicReports,

    upcomingExamCountdown: upcomingExams.map(addCountdown),

    averageScore,

    predictedGrade: getPredictedGrade(averageScore),

    badgesEarned,

    summary: {
      totalSubjects: profile.subjects.length,
      totalTodayTasks: todayRevisionTasks.length,
      totalWeakTopicReports: weakTopicReports.length,
      totalUpcomingExams: upcomingExams.length,
      totalBadgesEarned: badgesEarned.length,
    },
  });
});

module.exports = router;