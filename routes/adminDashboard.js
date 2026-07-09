const express = require("express");
const router = express.Router();

const { User } = require("../models/user");
const { StudentProfile } = require("../models/studentProfile");
const { TeacherProfile } = require("../models/teacherProfile");
const { ParentProfile } = require("../models/parentProfile");
const { Class } = require("../models/class");
const { Subject } = require("../models/subject");
const { Board } = require("../models/board");
const { SchoolFee } = require("../models/schoolFee");
const { Subscription } = require("../models/subscription");
const { Result } = require("../models/result");
const { ReportCard } = require("../models/reportCard");
const { StudentAnalytics } = require("../models/studentAnalytic");
const { Attendance } = require("../models/attendance");
const { WeakTopic } = require("../models/weakTopic");

function getGrade(average) {
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "E";
}

// SCHOOL ADMIN DASHBOARD
router.get("/", async (req, res) => {
  const students = await User.find({ role: "student" }).select("-password");
  const teachers = await User.find({ role: "teacher" }).select("-password");
  const parents = await User.find({ role: "parent" }).select("-password");
  const admins = await User.find({ role: "admin" }).select("-password");

  const studentProfiles = await StudentProfile.find()
    .populate("user", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects", "name code level category")
    .populate("parent", "name email role");

  const teacherProfiles = await TeacherProfile.find()
    .populate("user", "name email role")
    .populate("subjects", "name code level category")
    .populate("classes", "name syllabus");

  const parentProfiles = await ParentProfile.find()
    .populate("user", "name email role")
    .populate("students", "name email role");

  const classes = await Class.find()
    .populate("teacher", "name email role")
    .populate("students", "name email role")
    .sort("name");

  const subjects = await Subject.find()
    .populate("board_id", "name code")
    .sort("name");

  const boards = await Board.find().sort("name");

  const fees = await SchoolFee.find()
    .populate("student", "name email role")
    .sort("-createdAt");

  const subscriptions = await Subscription.find().sort("-createdAt");

  const results = await Result.find()
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  const reportCards = await ReportCard.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjects.subject", "name code level category")
    .sort("-createdAt");

  const analytics = await StudentAnalytics.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subjectPerformances.subject", "name code level category")
    .sort("-createdAt");

  const attendance = await Attendance.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .sort("-date");

  const weakTopics = await WeakTopic.find()
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  const totalFees = fees.reduce((sum, fee) => sum + fee.totalFee, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalBalance = fees.reduce((sum, fee) => sum + fee.balance, 0);

  const paidFees = fees.filter((fee) => fee.status === "PAID").length;
  const partlyPaidFees = fees.filter((fee) => fee.status === "PARTLY_PAID").length;
  const unpaidFees = fees.filter((fee) => fee.status === "UNPAID").length;

  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(
    (item) => item.status === "PRESENT" || item.status === "LATE"
  ).length;

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  const overallAverage =
    analytics.length > 0
      ? Math.round(
          analytics.reduce((sum, item) => sum + item.overallAverage, 0) /
            analytics.length
        )
      : 0;

  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const expiredSubscriptions = subscriptions.filter(
    (item) => item.status === "EXPIRED"
  ).length;

  res.send({
    summary: {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      totalParents: parents.length,
      totalAdmins: admins.length,
      totalClasses: classes.length,
      totalSubjects: subjects.length,
      totalExamBoards: boards.length,
      totalResults: results.length,
      totalReportCards: reportCards.length,
      totalWeakTopicReports: weakTopics.length,
      schoolAverageScore: overallAverage,
      schoolPredictedGrade: getGrade(overallAverage),
      attendanceRate,
    },

    usersManagement: {
      students,
      teachers,
      parents,
      admins,
      studentProfiles,
      teacherProfiles,
      parentProfiles,
    },

    academicManagement: {
      classes,
      subjects,
      examBoards: boards,
    },

    payments: {
      records: fees,
      totalFees,
      totalPaid,
      totalBalance,
      paidFees,
      partlyPaidFees,
      unpaidFees,
      paymentStatus:
        totalBalance === 0
          ? "PAID"
          : totalPaid > 0
          ? "PARTLY_PAID"
          : "UNPAID",
    },

    subscriptions: {
      records: subscriptions,
      activeSubscriptions,
      expiredSubscriptions,
    },

    reports: {
      results,
      reportCards,
      analytics,
      weakTopics,
    },

    schoolPerformanceAnalytics: {
      averageScore: overallAverage,
      predictedGrade: getGrade(overallAverage),
      attendanceRate,
      weakTopics,
      analytics,
    },

    actionEndpoints: {
      manageStudents: "GET/POST/PUT/DELETE /api/users",
      manageTeachers: "GET/POST/PUT/DELETE /api/users",
      manageClasses: "GET/POST/PUT/DELETE /api/classes",
      manageSubjects: "GET/POST/PUT/DELETE /api/subjects",
      manageExamBoards: "GET/POST/PUT/DELETE /api/boards",
      managePayments: "GET/POST/PUT/DELETE /api/schoolfees",
      manageSubscriptions: "GET/POST/PUT/DELETE /api/subscriptions",
      viewReports: "GET /api/reportcards",
      viewSchoolAnalytics: "GET /api/admindashboard",
    },
  });
});

module.exports = router;