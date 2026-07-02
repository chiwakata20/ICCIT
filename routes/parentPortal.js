const express = require("express");
const router = express.Router();

const { ParentProfile } = require("../models/parentProfile");
const { Attendance } = require("../models/attendance");
const { Result } = require("../models/result");
const { HomeworkSubmission } = require("../models/homeworkSubmission");
const { SchoolFee } = require("../models/schoolFee");
const { TeacherComment } = require("../models/teacherComment");

// GET PARENT DASHBOARD
router.get("/:parentUserId/dashboard", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  }).populate("students", "name email role");

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const studentIds = parentProfile.students.map((student) => student._id);

  const attendance = await Attendance.find({
    student: { $in: studentIds },
  })
    .populate("student", "name email")
    .populate("class", "name syllabus")
    .sort("-date");

  const results = await Result.find({
    student: { $in: studentIds },
  })
    .populate("student", "name email")
    .populate("subject", "name code level")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  const homework = await HomeworkSubmission.find({
    student: { $in: studentIds },
  })
    .populate("student", "name email")
    .populate("assignment", "title type dueDate totalMarks")
    .sort("-createdAt");

  const fees = await SchoolFee.find({
    student: { $in: studentIds },
  })
    .populate("student", "name email")
    .sort("-createdAt");

  const comments = await TeacherComment.find({
    student: { $in: studentIds },
    visibleToParent: true,
  })
    .populate("student", "name email")
    .populate("teacher", "name email")
    .populate("subject", "name code")
    .sort("-createdAt");

  res.send({
    parent: parentProfile,
    attendance,
    results,
    homework,
    fees,
    teacherComments: comments,
  });
});

// MONITOR ATTENDANCE
router.get("/:parentUserId/attendance", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  });

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const attendance = await Attendance.find({
    student: { $in: parentProfile.students },
  })
    .populate("student", "name email")
    .populate("class", "name syllabus")
    .sort("-date");

  res.send(attendance);
});

// MONITOR RESULTS
router.get("/:parentUserId/results", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  });

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const results = await Result.find({
    student: { $in: parentProfile.students },
  })
    .populate("student", "name email")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(results);
});

// MONITOR HOMEWORK COMPLETION
router.get("/:parentUserId/homework", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  });

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const homework = await HomeworkSubmission.find({
    student: { $in: parentProfile.students },
  })
    .populate("student", "name email")
    .populate("assignment", "title type dueDate totalMarks")
    .sort("-createdAt");

  res.send(homework);
});

// SCHOOL FEE BALANCES
router.get("/:parentUserId/fees", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  });

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const fees = await SchoolFee.find({
    student: { $in: parentProfile.students },
  })
    .populate("student", "name email")
    .sort("-createdAt");

  res.send(fees);
});

// TEACHER COMMENTS
router.get("/:parentUserId/comments", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  });

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const comments = await TeacherComment.find({
    student: { $in: parentProfile.students },
    visibleToParent: true,
  })
    .populate("student", "name email")
    .populate("teacher", "name email")
    .populate("subject", "name code")
    .sort("-createdAt");

  res.send(comments);
});

// WHATSAPP NOTIFICATION LINK
router.get("/:parentUserId/whatsapp", async (req, res) => {
  const parentProfile = await ParentProfile.findOne({
    user: req.params.parentUserId,
  }).populate("students", "name email");

  if (!parentProfile) return res.status(404).send("Parent profile not found.");

  const phone = parentProfile.phone.replace("+", "");

  const studentNames = parentProfile.students
    .map((student) => student.name)
    .join(", ");

  const message = `Hello, this is a school update regarding: ${studentNames}. Please login to the parent portal to view attendance, results, homework, fees and teacher comments.`;

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    message
  )}`;

  res.send({
    phone: parentProfile.phone,
    message,
    whatsappUrl,
  });
});

module.exports = router;