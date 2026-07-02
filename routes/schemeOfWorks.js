const express = require("express");
const router = express.Router();

const {
  SchemeOfWork,
  validate,
} = require("../models/schemeOfWork");

const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

// GET ALL SCHEMES
router.get("/", async (req, res) => {
  const schemes = await SchemeOfWork.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(schemes);
});

// GET SCHEMES BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const schemes = await SchemeOfWork.find({
    teacher: req.params.teacherId,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(schemes);
});

// GET SCHEMES BY CLASS
router.get("/class/:classId", async (req, res) => {
  const schemes = await SchemeOfWork.find({
    class: req.params.classId,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(schemes);
});

// GET SINGLE SCHEME
router.get("/:id", async (req, res) => {
  const scheme = await SchemeOfWork.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!scheme) return res.status(404).send("Scheme of work not found.");

  res.send(scheme);
});

// CREATE SCHEME
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

  const scheme = new SchemeOfWork({
    title: req.body.title,
    teacher: req.body.teacher,
    subject: req.body.subject,
    class: req.body.class,
    syllabus: req.body.syllabus,
    term: req.body.term,
    year: req.body.year,
    weeks: req.body.weeks,
    status: req.body.status,
    adminComment: req.body.adminComment,
  });

  await scheme.save();

  res.send(scheme);
});

// UPDATE SCHEME
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const scheme = await SchemeOfWork.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      teacher: req.body.teacher,
      subject: req.body.subject,
      class: req.body.class,
      syllabus: req.body.syllabus,
      term: req.body.term,
      year: req.body.year,
      weeks: req.body.weeks,
      status: req.body.status,
      adminComment: req.body.adminComment,
    },
    { new: true }
  );

  if (!scheme) return res.status(404).send("Scheme of work not found.");

  res.send(scheme);
});

// APPROVE / REJECT SCHEME
router.put("/:id/status", async (req, res) => {
  const scheme = await SchemeOfWork.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      adminComment: req.body.adminComment,
    },
    { new: true }
  );

  if (!scheme) return res.status(404).send("Scheme of work not found.");

  res.send(scheme);
});

// DELETE SCHEME
router.delete("/:id", async (req, res) => {
  const scheme = await SchemeOfWork.findByIdAndDelete(req.params.id);

  if (!scheme) return res.status(404).send("Scheme of work not found.");

  res.send(scheme);
});

module.exports = router;