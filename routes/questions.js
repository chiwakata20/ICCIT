const express = require("express");
const router = express.Router();

const {
  Question,
  validate,
} = require("../models/question");

const { PastPaper } = require("../models/pastPaper");
const { Subject } = require("../models/subject");
const { SyllabusTopic } = require("../models/syllabusTopic");

// GET QUESTIONS
router.get("/", async (req, res) => {
  const questions = await Question.find()
    .populate("pastPaper", "title year paperCode syllabus")
    .populate("subject", "name code level category")
    .populate("topic_id", "title name")
    .sort("questionNumber");

  res.send(questions);
});

// FILTER QUESTIONS
router.get("/filter", async (req, res) => {
  const { pastPaper, subject, topic_id, difficulty, questionType } = req.query;

  const filter = {};

  if (pastPaper) filter.pastPaper = pastPaper;
  if (subject) filter.subject = subject;
  if (topic_id) filter.topic_id = topic_id;
  if (difficulty) filter.difficulty = difficulty;
  if (questionType) filter.questionType = questionType;

  const questions = await Question.find(filter)
    .populate("pastPaper", "title year paperCode syllabus")
    .populate("subject", "name code level category")
    .populate("topic_id", "title name")
    .sort("questionNumber");

  res.send(questions);
});

// GET SINGLE QUESTION
router.get("/:id", async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate("pastPaper", "title year paperCode syllabus")
    .populate("subject", "name code level category")
    .populate("topic_id", "title name");

  if (!question) return res.status(404).send(" question not found.");

  res.send(question);
});

// CREATE QUESTION
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const paper = await PastPaper.findById(req.body.pastPaper);
  if (!paper) return res.status(400).send("Invalid past paper.");

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const topic = await SyllabusTopic.findById(req.body.topic_id);
  if (!topic) return res.status(400).send("Invalid topic.");

  const question = new Question({
    pastPaper: req.body.pastPaper,
    subject: req.body.subject,
    topic_id: req.body.topic_id,
    questionNumber: req.body.questionNumber,
    questionText: req.body.questionText,
    questionType: req.body.questionType,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer,
    modelAnswer: req.body.modelAnswer,
    explanation: req.body.explanation,
    examinerComment: req.body.examinerComment,
    commonMistakes: req.body.commonMistakes,
    improvementTips: req.body.improvementTips,
    marks: req.body.marks,
    difficulty: req.body.difficulty,
  });

  await question.save();

  res.send(question);
});

// UPDATE QUESTION
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const question = await Question.findByIdAndUpdate(
    req.params.id,
    {
      pastPaper: req.body.pastPaper,
      subject: req.body.subject,
      topic_id: req.body.topic_id,
      questionNumber: req.body.questionNumber,
      questionText: req.body.questionText,
      questionType: req.body.questionType,
      options: req.body.options,
      correctAnswer: req.body.correctAnswer,
      modelAnswer: req.body.modelAnswer,
      explanation: req.body.explanation,
      examinerComment: req.body.examinerComment,
      commonMistakes: req.body.commonMistakes,
      improvementTips: req.body.improvementTips,
      marks: req.body.marks,
      difficulty: req.body.difficulty,
    },
    { new: true }
  );

  if (!question) return res.status(404).send(" question not found.");

  res.send(question);
});

// DELETE QUESTION
router.delete("/:id", async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);

  if (!question) return res.status(404).send(" question not found.");

  res.send(question);
});

module.exports = router;