const express = require("express");
const router = express.Router();

const { PastPaper, validate } = require("../models/pastPaper");
const { Subject } = require("../models/subject");
const { Attachment } = require("../models/attachment");

// GET ALL PAST PAPERS
router.get("/", async (req, res) => {
  const papers = await PastPaper.find()
    .populate("subject", "name code level category")
    .populate("paperFile", "originalName filePath fileType fileSize")
    .populate("markingSchemeFile", "originalName filePath fileType fileSize")
    .sort("-year");

  res.send(papers);
});

// SEARCH PAST PAPERS
router.get("/search", async (req, res) => {
  const { subject, year, syllabus, difficulty, paperCode } = req.query;

  const filter = { is_published: true };

  if (subject) filter.subject = subject;
  if (year) filter.year = Number(year);
  if (syllabus) filter.syllabus = syllabus;
  if (difficulty) filter.difficulty = difficulty;
  if (paperCode) filter.paperCode = paperCode;

  const papers = await PastPaper.find(filter)
    .populate("subject", "name code level category")
    .populate("paperFile", "originalName filePath fileType fileSize")
    .populate("markingSchemeFile", "originalName filePath fileType fileSize")
    .sort("-year");

  res.send(papers);
});

// GET SINGLE PAST PAPER
router.get("/:id", async (req, res) => {
  const paper = await PastPaper.findById(req.params.id)
    .populate("subject", "name code level category")
    .populate("paperFile", "originalName filePath fileType fileSize")
    .populate("markingSchemeFile", "originalName filePath fileType fileSize");

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

// CREATE PAST PAPER
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  if (req.body.paperFile) {
    const paperFile = await Attachment.findById(req.body.paperFile);
    if (!paperFile) return res.status(400).send("Invalid paper file.");
  }

  if (req.body.markingSchemeFile) {
    const markingScheme = await Attachment.findById(req.body.markingSchemeFile);
    if (!markingScheme) return res.status(400).send("Invalid marking scheme file.");
  }

  const paper = new PastPaper({
    title: req.body.title,
    syllabus: req.body.syllabus,
    subject: req.body.subject,
    paperCode: req.body.paperCode,
    year: req.body.year,
    session: req.body.session,
    difficulty: req.body.difficulty,
    paperFile: req.body.paperFile || undefined,
    markingSchemeFile: req.body.markingSchemeFile || undefined,
    is_published: req.body.is_published,
  });

  await paper.save();

  res.send(paper);
});

// UPDATE PAST PAPER
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const paper = await PastPaper.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      syllabus: req.body.syllabus,
      subject: req.body.subject,
      paperCode: req.body.paperCode,
      year: req.body.year,
      session: req.body.session,
      difficulty: req.body.difficulty,
      paperFile: req.body.paperFile || undefined,
      markingSchemeFile: req.body.markingSchemeFile || undefined,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

// DELETE PAST PAPER
router.delete("/:id", async (req, res) => {
  const paper = await PastPaper.findByIdAndDelete(req.params.id);

  if (!paper) return res.status(404).send("Past paper not found.");

  res.send(paper);
});

module.exports = router;