const express = require("express");
const router = express.Router();

const {
  HomeworkSubmission,
  validate,
} = require("../models/homeworkSubmission");

const { Assignment } = require("../models/assignment");
const { User } = require("../models/user");

// GET ALL HOMEWORK SUBMISSIONS
router.get("/", async (req, res) => {
  const submissions = await HomeworkSubmission.find()
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate totalMarks")
    .sort("-createdAt");

  res.send(submissions);
});

// GET SINGLE HOMEWORK SUBMISSION
router.get("/:id", async (req, res) => {
  const submission = await HomeworkSubmission.findById(req.params.id)
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate totalMarks");

  if (!submission) {
    return res.status(404).send("Homework submission not found.");
  }

  res.send(submission);
});

// GET SUBMISSIONS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const submissions = await HomeworkSubmission.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("assignment", "title type dueDate totalMarks")
    .sort("-createdAt");

  res.send(submissions);
});

// CREATE HOMEWORK SUBMISSION
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const assignment = await Assignment.findById(req.body.assignment);
  if (!assignment) return res.status(400).send("Invalid assignment.");

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  let submission = await HomeworkSubmission.findOne({
    assignment: req.body.assignment,
    student: req.body.student,
  });

  if (submission) {
    return res.status(400).send("Homework already submitted by this student.");
  }

  submission = new HomeworkSubmission({
    homework: req.body.homework,
    assignment: req.body.assignment,
    student: req.body.student,
    status: req.body.status,
    submittedAt: req.body.submittedAt,
    fileUrl: req.body.fileUrl,
    marksAwarded: req.body.marksAwarded,
    teacherFeedback: req.body.teacherFeedback,
  });

  await submission.save();

  res.send(submission);
});

// UPDATE HOMEWORK SUBMISSION / MARK HOMEWORK
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const submission = await HomeworkSubmission.findByIdAndUpdate(
    req.params.id,
    {
      homework: req.body.homework,
      assignment: req.body.assignment,
      student: req.body.student,
      status: req.body.status,
      submittedAt: req.body.submittedAt,
      fileUrl: req.body.fileUrl,
      marksAwarded: req.body.marksAwarded,
      teacherFeedback: req.body.teacherFeedback,
    },
    { new: true }
  );

  if (!submission) {
    return res.status(404).send("Homework submission not found.");
  }

  res.send(submission);
});

// DELETE HOMEWORK SUBMISSION
router.delete("/:id", async (req, res) => {
  const submission = await HomeworkSubmission.findByIdAndDelete(req.params.id);

  if (!submission) {
    return res.status(404).send("Homework submission not found.");
  }

  res.send(submission);
});

module.exports = router;