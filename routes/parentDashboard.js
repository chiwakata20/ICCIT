const express = require("express");
const router = express.Router();

const { ParentProfile } = require("../models/parentProfile");
const { StudentProfile } = require("../models/studentProfile");
const { RevisionTask } = require("../models/revisionTask");
const { Quiz } = require("../models/quiz");
const { MockExamSubmission } = require("../models/mockExamSubmission");
const { WeakTopic } = require("../models/weakTopic");
const { Result } = require("../models/result");
const { StudentAnalytics } = require("../models/studentAnalytic");
const { TeacherComment } = require("../models/teacherComment");
const { SchoolFee } = require("../models/schoolFee");

function getPredictedGrade(average) {
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "E";
}

// GET PARENT DASHBOARD
router.get("/:parentUserId", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  }).populate("students", "name email role");

  if (!parentProfile) {
    return res.status(404).send("Parent profile not found.");
  }

  const dashboardStudents = [];

  for (const studentUser of parentProfile.students) {
    const studentProfile = await StudentProfile.findOne({
      user: studentUser._id,
    })
      .populate("user", "name email role")
      .populate("class", "name syllabus")
      .populate("subjects", "name code level category");

    if (!studentProfile) continue;

    const revisionTasks = await RevisionTask.find({
      student: studentUser._id,
    })
      .populate("subject", "name code level category")
      .sort("-taskDate");

    const completedRevisionTasks = revisionTasks.filter(
      (task) => task.status === "COMPLETED"
    );

    const missedTasks = revisionTasks.filter(
      (task) =>
        task.status !== "COMPLETED" &&
        new Date(task.taskDate) < new Date()
    );

    const timeSpentInRevision = completedRevisionTasks.reduce(
      (total, task) => total + (task.actualMinutesSpent || task.estimatedMinutes || 0),
      0
    );

    const weakTopics = await WeakTopic.find({
      student: studentUser._id,
    })
      .populate("subject", "name code level category")
      .populate("class", "name syllabus")
      .sort("-createdAt")
      .limit(5);

    const mockExamSubmissions = await MockExamSubmission.find({
      student: studentUser._id,
    })
      .populate("mockExam", "title syllabus totalMarks durationMinutes")
      .sort("-createdAt")
      .limit(5);

    const results = await Result.find({
      student: studentUser._id,
    })
      .populate("subject", "name code level category")
      .populate("class", "name syllabus")
      .sort("-createdAt")
      .limit(10);

    const latestAnalytics = await StudentAnalytics.findOne({
      student: studentUser._id,
    })
      .populate("class", "name syllabus")
      .populate("subjectPerformances.subject", "name code level category")
      .sort("-createdAt");

    const averageScore = latestAnalytics ? latestAnalytics.overallAverage : 0;

    const teacherComments = await TeacherComment.find({
      student: studentUser._id,
      visibleToParent: true,
    })
      .populate("teacher", "name email role")
      .populate("subject", "name code level category")
      .sort("-createdAt")
      .limit(5);

    const payments = await SchoolFee.find({
      student: studentUser._id,
    }).sort("-createdAt");

    const totalFees = payments.reduce((sum, fee) => sum + fee.totalFee, 0);
    const totalPaid = payments.reduce((sum, fee) => sum + fee.amountPaid, 0);
    const totalBalance = payments.reduce((sum, fee) => sum + fee.balance, 0);

    dashboardStudents.push({
      student: studentProfile.user,
      class: studentProfile.class,
      subjects: studentProfile.subjects,

      revision: {
        timeSpentInMinutes: timeSpentInRevision,
        timeSpentInHours: Math.round((timeSpentInRevision / 60) * 10) / 10,
        totalTasks: revisionTasks.length,
        completedTasks: completedRevisionTasks.length,
        missedTasks,
      },

      quizScores: [],

      weakTopics,

      mockExams: mockExamSubmissions,

      results,

      performance: {
        averageScore,
        predictedGrade: getPredictedGrade(averageScore),
        analytics: latestAnalytics,
      },

      teacherComments,

      payments: {
        records: payments,
        totalFees,
        totalPaid,
        totalBalance,
        status:
          totalBalance === 0
            ? "PAID"
            : totalPaid > 0
            ? "PARTLY_PAID"
            : "UNPAID",
      },
    });
  }

  res.send({
    parent: parentProfile,
    students: dashboardStudents,
  });
});

module.exports = router;