const express = require("express");
const router = express.Router();

const { Result, validate } = require("../models/result");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

// GET ALL RESULTS
router.get("/", async (req, res) => {
  const results = await Result.find()
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(results);
});

// GET SINGLE RESULT
router.get("/:id", async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!result) return res.status(404).send("Result not found.");

  res.send(result);
});

// GET RESULTS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const results = await Result.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(results);
});

// CREATE RESULT
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const percentage = (req.body.score / req.body.totalMarks) * 100;

  let grade = req.body.grade;
  if (!grade) {
    if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "E";
  }

  const result = new Result({
    student: req.body.student,
    subject: req.body.subject,
    class: req.body.class,
    term: req.body.term,
    examType: req.body.examType,
    score: req.body.score,
    totalMarks: req.body.totalMarks,
    grade,
    teacherComment: req.body.teacherComment,
  });

  await result.save();

  res.send(result);
});

// UPDATE RESULT
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const percentage = (req.body.score / req.body.totalMarks) * 100;

  let grade = req.body.grade;
  if (!grade) {
    if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "E";
  }

  const result = await Result.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      subject: req.body.subject,
      class: req.body.class,
      term: req.body.term,
      examType: req.body.examType,
      score: req.body.score,
      totalMarks: req.body.totalMarks,
      grade,
      teacherComment: req.body.teacherComment,
    },
    { new: true }
  );

  if (!result) return res.status(404).send("Result not found.");

  res.send(result);
});

// DELETE RESULT
router.delete("/:id", async (req, res) => {
  const result = await Result.findByIdAndDelete(req.params.id);

  if (!result) return res.status(404).send("Result not found.");

  res.send(result);
});

module.exports = router;