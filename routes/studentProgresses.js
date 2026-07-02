const express = require("express");
const router = express.Router();
const {
  StudentProgress,
  validateStudentProgress,
} = require("../models/StudentProgress");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.student_id) filter.student_id = req.query.student_id;
  if (req.query.subject_id) filter.subject_id = req.query.subject_id;
  if (req.query.topic_id) filter.topic_id = req.query.topic_id;
  if (req.query.status) filter.status = req.query.status;

  const progress = await StudentProgress.find(filter)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title")
    .sort("-updatedAt");

  res.send(progress);
});

router.get("/:id", async (req, res) => {
  const progress = await StudentProgress.findById(req.params.id)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title");

  if (!progress) return res.status(404).send("Progress record not found.");

  res.send(progress);
});

router.post("/", async (req, res) => {
  const { error } = validateStudentProgress(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const progress = new StudentProgress(req.body);
  await progress.save();

  res.status(201).send(progress);
});

router.put("/:id", async (req, res) => {
  const { error } = validateStudentProgress(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const progress = await StudentProgress.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!progress) return res.status(404).send("Progress record not found.");

  res.send(progress);
});

router.delete("/:id", async (req, res) => {
  const progress = await StudentProgress.findByIdAndDelete(req.params.id);

  if (!progress) return res.status(404).send("Progress record not found.");

  res.send(progress);
});

module.exports = router;