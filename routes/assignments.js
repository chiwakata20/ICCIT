const express = require("express");
const router = express.Router();

const { Assignment, validate } = require("../models/assignment");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");



// GET ALL ASSIGNMENTS AND TESTS
router.get("/", async (req, res) => {
  const assignments = await Assignment.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(assignments);
});

// GET SINGLE ASSIGNMENT OR TEST
router.get("/:id", async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!assignment) return res.status(404).send("Assignment/Test not found.");

  res.send(assignment);
});

// CREATE ASSIGNMENT OR TEST
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

  const assignment = new Assignment({
    title: req.body.title,
    type: req.body.type,
    subject: req.body.subject,
    class: req.body.class,
    teacher: req.body.teacher,
    instructions: req.body.instructions,
    questions: req.body.questions,
    totalMarks: req.body.totalMarks,
    dueDate: req.body.dueDate,
    is_published: req.body.is_published,
  });

  await assignment.save();

  res.status(201).send(assignment);
});

// UPDATE ASSIGNMENT OR TEST
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      type: req.body.type,
      subject: req.body.subject,
      class: req.body.class,
      teacher: req.body.teacher,
      instructions: req.body.instructions,
      questions: req.body.questions,
      totalMarks: req.body.totalMarks,
      dueDate: req.body.dueDate,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!assignment) return res.status(404).send("Assignment/Test not found.");

  res.send(assignment);
});

// DELETE ASSIGNMENT OR TEST
router.delete("/:id", async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) return res.status(404).send("Assignment/Test not found.");

  res.send(assignment);
});

module.exports = router;