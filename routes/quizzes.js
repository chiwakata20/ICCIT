const express = require("express");
const router = express.Router();

const { Quiz, validate } = require("../models/quiz");
const { Lesson } = require("../models/lesson");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { User } = require("../models/user");

// GET ALL QUIZZES
router.get("/", async (req, res) => {
  const quizzes = await Quiz.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .sort("-createdAt");

  res.send(quizzes);
});

// GET SINGLE QUIZ
router.get("/:id", async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title");

  if (!quiz) return res.status(404).send("Quiz not found.");

  res.send(quiz);
});

// CREATE QUIZ
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const lesson = await Lesson.findById(req.body.lesson);
  if (!lesson) return res.status(400).send("Invalid lesson.");

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const totalMarks =
    req.body.totalMarks ||
    req.body.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const quiz = new Quiz({
    title: req.body.title,
    lesson: req.body.lesson,
    subject: req.body.subject,
    class: req.body.class,
    teacher: req.body.teacher,
    instructions: req.body.instructions,
    questions: req.body.questions,
    totalMarks,
    durationMinutes: req.body.durationMinutes,
    is_published: req.body.is_published,
  });

  await quiz.save();

  res.send(quiz);
});

// UPDATE QUIZ
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const totalMarks =
    req.body.totalMarks ||
    req.body.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      lesson: req.body.lesson,
      subject: req.body.subject,
      class: req.body.class,
      teacher: req.body.teacher,
      instructions: req.body.instructions,
      questions: req.body.questions,
      totalMarks,
      durationMinutes: req.body.durationMinutes,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!quiz) return res.status(404).send("Quiz not found.");

  res.send(quiz);
});

// DELETE QUIZ
router.delete("/:id", async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);

  if (!quiz) return res.status(404).send("Quiz not found.");

  res.send(quiz);
});

module.exports = router;