const express = require("express");
const router = express.Router();
const { PastPaper, validatePastPaper } = require("../models/PastPaper");
const { Subject } = require("../models/Subject");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.subject_id) filter.subject_id = req.query.subject_id;
  if (req.query.year) filter.year = Number(req.query.year);
  if (req.query.exam_session) filter.exam_session = req.query.exam_session;
  if (req.query.paper_number) filter.paper_number = req.query.paper_number;
  if (req.query.paper_type) filter.paper_type = req.query.paper_type;
  if (req.query.approved) filter.approved = req.query.approved === "true";

  const papers = await PastPaper.find(filter)
    .populate("subject_id", "name code level")
    .sort("-year exam_session paper_number");

  res.send(papers);
});

router.get("/:id", async (req, res) => {
  const paper = await PastPaper.findById(req.params.id).populate(
    "subject_id",
    "name code level"
  );

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

router.post("/", async (req, res) => {
  const { error } = validatePastPaper(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject_id);
  if (!subject) return res.status(400).send("Invalid subject_id.");

  const paper = new PastPaper(req.body);
  await paper.save();

  res.status(201).send(paper);
});

router.put("/:id", async (req, res) => {
  const { error } = validatePastPaper(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const paper = await PastPaper.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

router.patch("/:id/approve", async (req, res) => {
  const paper = await PastPaper.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  );

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

router.delete("/:id", async (req, res) => {
  const paper = await PastPaper.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

module.exports = router;