const express = require("express");
const router = express.Router();
const { Question, validateQuestion } = require("../models/Question");
const { Subject } = require("../models/Subject");
const { SyllabusTopic } = require("../models/SyllabusTopic");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.subject_id) filter.subject_id = req.query.subject_id;
  if (req.query.topic_id) filter.topic_id = req.query.topic_id;
  if (req.query.question_type) filter.question_type = req.query.question_type;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  if (req.query.paper) filter.paper = req.query.paper;
  if (req.query.approved) filter.approved = req.query.approved === "true";

  const questions = await Question.find(filter)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title")
    .sort("-createdAt");

  res.send(questions);
});

router.get("/:id", async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title");

  if (!question) return res.status(404).send("Question not found.");

  res.send(question);
});

router.post("/", async (req, res) => {
  const { error } = validateQuestion(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject_id);
  if (!subject) return res.status(400).send("Invalid subject_id.");

  const topic = await SyllabusTopic.findById(req.body.topic_id);
  if (!topic) return res.status(400).send("Invalid topic_id.");

  const question = new Question(req.body);
  await question.save();

  res.status(201).send(question);
});

router.put("/:id", async (req, res) => {
  const { error } = validateQuestion(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!question) return res.status(404).send("Question not found.");

  res.send(question);
});

router.patch("/:id/approve", async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  );

  if (!question) return res.status(404).send("Question not found.");

  res.send(question);
});

router.delete("/:id", async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!question) return res.status(404).send("Question not found.");

  res.send(question);
});

module.exports = router;