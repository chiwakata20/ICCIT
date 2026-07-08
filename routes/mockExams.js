const express = require("express");
const router = express.Router();

const { MockExam, validate } = require("../models/mockExam");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Question } = require("../models/question");

// GET ALL MOCK EXAMS
router.get("/", async (req, res) => {
  const exams = await MockExam.find()
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("teacher", "name email role")
    .populate("questions")
    .sort("-createdAt");

  res.send(exams);
});

// GET PUBLISHED MOCK EXAMS
router.get("/published", async (req, res) => {
  const exams = await MockExam.find({
    status: "PUBLISHED",
    is_active: true,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("teacher", "name email role")
    .populate("questions")
    .sort("-createdAt");

  res.send(exams);
});

// GET MOCK EXAMS BY CLASS
router.get("/class/:classId", async (req, res) => {
  const exams = await MockExam.find({
    class: req.params.classId,
    is_active: true,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("teacher", "name email role")
    .populate("questions")
    .sort("-createdAt");

  res.send(exams);
});

// GET MOCK EXAMS BY SUBJECT
router.get("/subject/:subjectId", async (req, res) => {
  const exams = await MockExam.find({
    subject: req.params.subjectId,
    is_active: true,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("teacher", "name email role")
    .populate("questions")
    .sort("-createdAt");

  res.send(exams);
});

// GET SINGLE MOCK EXAM
router.get("/:id", async (req, res) => {
  const exam = await MockExam.findById(req.params.id)
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("teacher", "name email role")
    .populate("questions");

  if (!exam) return res.status(404).send("Mock exam not found.");

  res.send(exam);
});

// CREATE MOCK EXAM
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  let totalMarks = 0;

  for (const questionId of req.body.questions) {
    const question = await Question.findById(questionId);
    if (!question) return res.status(400).send("Invalid question: " + questionId);

    totalMarks += question.marks || question.points || 1;
  }

  const exam = new MockExam({
    title: req.body.title,
    syllabus: req.body.syllabus,
    subject: req.body.subject,
    class: req.body.class,
    teacher: req.body.teacher,
    questions: req.body.questions,
    instructions: req.body.instructions,
    durationMinutes: req.body.durationMinutes,
    totalMarks: req.body.totalMarks || totalMarks,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status,
    is_active: req.body.is_active,
  });

  await exam.save();

  res.send(exam);
});

// UPDATE MOCK EXAM
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let totalMarks = 0;

  for (const questionId of req.body.questions) {
    const question = await Question.findById(questionId);
    if (!question) return res.status(400).send("Invalid question: " + questionId);

    totalMarks += question.marks || question.points || 1;
  }

  const exam = await MockExam.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      syllabus: req.body.syllabus,
      subject: req.body.subject,
      class: req.body.class,
      teacher: req.body.teacher,
      questions: req.body.questions,
      instructions: req.body.instructions,
      durationMinutes: req.body.durationMinutes,
      totalMarks: req.body.totalMarks || totalMarks,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!exam) return res.status(404).send("Mock exam not found.");

  res.send(exam);
});

// PUBLISH / CLOSE MOCK EXAM
router.put("/:id/status", async (req, res) => {
  const exam = await MockExam.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!exam) return res.status(404).send("Mock exam not found.");

  res.send(exam);
});

// DELETE MOCK EXAM
router.delete("/:id", async (req, res) => {
  const exam = await MockExam.findByIdAndDelete(req.params.id);

  if (!exam) return res.status(404).send("Mock exam not found.");

  res.send(exam);
});

module.exports = router;