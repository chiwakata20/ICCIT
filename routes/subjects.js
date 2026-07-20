const express = require("express");
const router = express.Router();
const { Subject, validateSubject } = require("../models/subject");
const { Board } = require("../models/Board");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.board_id) filter.board_id = req.query.board_id;
  if (req.query.level) filter.level = req.query.level;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: "i" };
  }

  const subjects = await Subject.find(filter)
    .populate("board_id", "name")
    .sort("name");

  res.send(subjects);
});

router.get("/:id", async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate("board_id", "name");

  if (!subject) return res.status(404).send("Subject not found.");

  res.send(subject);
});

router.post("/", async (req, res) => {
  const { error } = validateSubject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const board = await Board.findById(req.body.board_id);
  if (!board) return res.status(400).send("Invalid board_id.");

  const subject = new Subject(req.body);
  await subject.save();

  res.status(201).send(subject);
});

router.put("/:id", async (req, res) => {
  const { error } = validateSubject(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!subject) return res.status(404).send("Subject not found.");

  res.send(subject);
});

router.delete("/:id", async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!subject) return res.status(404).send("Subject not found.");

  res.send(subject);
});

module.exports = router;