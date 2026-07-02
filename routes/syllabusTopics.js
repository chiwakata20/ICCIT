const express = require("express");
const router = express.Router();
const {
  SyllabusTopic,
  validateSyllabusTopic,
} = require("../models/SyllabusTopic");
const { Subject } = require("../models/Subject");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.subject_id) filter.subject_id = req.query.subject_id;
  if (req.query.paper) filter.paper = req.query.paper;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  const topics = await SyllabusTopic.find(filter)
    .populate("subject_id", "name code level")
    .sort("order_number");

  res.send(topics);
});

router.get("/:id", async (req, res) => {
  const topic = await SyllabusTopic.findById(req.params.id).populate(
    "subject_id",
    "name code level"
  );

  if (!topic) return res.status(404).send("Syllabus topic not found.");

  res.send(topic);
});

router.post("/", async (req, res) => {
  const { error } = validateSyllabusTopic(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject_id);
  if (!subject) return res.status(400).send("Invalid subject_id.");

  const topic = new SyllabusTopic(req.body);
  await topic.save();

  res.status(201).send(topic);
});

router.put("/:id", async (req, res) => {
  const { error } = validateSyllabusTopic(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const topic = await SyllabusTopic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!topic) return res.status(404).send("Syllabus topic not found.");

  res.send(topic);
});

router.delete("/:id", async (req, res) => {
  const topic = await SyllabusTopic.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!topic) return res.status(404).send("Syllabus topic not found.");

  res.send(topic);
});

module.exports = router;