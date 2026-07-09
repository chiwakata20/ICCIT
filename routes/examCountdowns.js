const express = require("express");
const router = express.Router();

const { ExamCountdown, validate } = require("../models/examCountdown");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { StudentProfile } = require("../models/studentProfile");

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

// GET ALL EXAM COUNTDOWNS
router.get("/", async (req, res) => {
  const exams = await ExamCountdown.find()
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("createdBy", "name email role")
    .sort("examDate");

  res.send(exams.map(addCountdown));
});

// GET PUBLISHED UPCOMING EXAMS
router.get("/upcoming", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exams = await ExamCountdown.find({
    examDate: { $gte: today },
    status: "PUBLISHED",
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("createdBy", "name email role")
    .sort("examDate");

  res.send(exams.map(addCountdown));
});

// GET UPCOMING EXAMS FOR STUDENT
router.get("/student/:studentId/upcoming", async (req, res) => {
  const student = await User.findById(req.params.studentId);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const studentProfile = await StudentProfile.findOne({
    user: req.params.studentId,
  });

  if (!studentProfile) return res.status(404).send("Student profile not found.");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exams = await ExamCountdown.find({
    class: studentProfile.class,
    examDate: { $gte: today },
    status: "PUBLISHED",
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("createdBy", "name email role")
    .sort("examDate");

  res.send(exams.map(addCountdown));
});

// GET EXAMS BY CLASS
router.get("/class/:classId", async (req, res) => {
  const exams = await ExamCountdown.find({
    class: req.params.classId,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("createdBy", "name email role")
    .sort("examDate");

  res.send(exams.map(addCountdown));
});

// GET SINGLE EXAM COUNTDOWN
router.get("/:id", async (req, res) => {
  const exam = await ExamCountdown.findById(req.params.id)
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("createdBy", "name email role");

  if (!exam) return res.status(404).send("Exam countdown not found.");

  res.send(addCountdown(exam));
});

// CREATE EXAM COUNTDOWN
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const createdBy = await User.findById(req.body.createdBy);
  if (!createdBy) return res.status(400).send("Invalid createdBy user.");

  const exam = new ExamCountdown({
    title: req.body.title,
    examType: req.body.examType,
    syllabus: req.body.syllabus,
    subject: req.body.subject,
    class: req.body.class,
    examDate: req.body.examDate,
    startTime: req.body.startTime,
    durationMinutes: req.body.durationMinutes,
    venue: req.body.venue,
    instructions: req.body.instructions,
    createdBy: req.body.createdBy,
    status: req.body.status,
  });

  await exam.save();

  res.send(addCountdown(exam));
});

// UPDATE EXAM COUNTDOWN
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exam = await ExamCountdown.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      examType: req.body.examType,
      syllabus: req.body.syllabus,
      subject: req.body.subject,
      class: req.body.class,
      examDate: req.body.examDate,
      startTime: req.body.startTime,
      durationMinutes: req.body.durationMinutes,
      venue: req.body.venue,
      instructions: req.body.instructions,
      createdBy: req.body.createdBy,
      status: req.body.status,
    },
    { new: true }
  );

  if (!exam) return res.status(404).send("Exam countdown not found.");

  res.send(addCountdown(exam));
});

// CHANGE STATUS
router.put("/:id/status", async (req, res) => {
  const exam = await ExamCountdown.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!exam) return res.status(404).send("Exam countdown not found.");

  res.send(addCountdown(exam));
});

// DELETE EXAM COUNTDOWN
router.delete("/:id", async (req, res) => {
  const exam = await ExamCountdown.findByIdAndDelete(req.params.id);

  if (!exam) return res.status(404).send("Exam countdown not found.");

  res.send(exam);
});

module.exports = router;