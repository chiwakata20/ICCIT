const express = require("express");
const router = express.Router();

const {
  TeacherComment,
  validate,
} = require("../models/teacherComment");

const { User } = require("../models/user");
const { Subject } = require("../models/subject");

// GET ALL COMMENTS
router.get("/", async (req, res) => {
  const comments = await TeacherComment.find()
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .sort("-createdAt");

  res.send(comments);
});

// GET SINGLE COMMENT
router.get("/:id", async (req, res) => {
  const comment = await TeacherComment.findById(req.params.id)
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category");

  if (!comment)
    return res.status(404).send("Teacher comment not found.");

  res.send(comment);
});

// GET COMMENTS FOR A STUDENT
router.get("/student/:studentId", async (req, res) => {
  const comments = await TeacherComment.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .sort("-createdAt");

  res.send(comments);
});

// GET COMMENTS BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const comments = await TeacherComment.find({
    teacher: req.params.teacherId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .sort("-createdAt");

  res.send(comments);
});

// CREATE COMMENT
router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error)
    return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);

  if (!student)
    return res.status(400).send("Invalid student.");

  if (student.role !== "student")
    return res.status(400).send("User must have role student.");

  const teacher = await User.findById(req.body.teacher);

  if (!teacher)
    return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher")
    return res.status(400).send("User must have role teacher.");

  if (req.body.subject) {
    const subject = await Subject.findById(req.body.subject);

    if (!subject)
      return res.status(400).send("Invalid subject.");
  }

  const comment = new TeacherComment({
    student: req.body.student,
    teacher: req.body.teacher,
    subject: req.body.subject,
    comment: req.body.comment,
    visibleToParent:
      req.body.visibleToParent !== undefined
        ? req.body.visibleToParent
        : true,
  });

  await comment.save();

  res.send(comment);
});

// UPDATE COMMENT
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error)
    return res.status(400).send(error.details[0].message);

  const comment = await TeacherComment.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      teacher: req.body.teacher,
      subject: req.body.subject,
      comment: req.body.comment,
      visibleToParent: req.body.visibleToParent,
    },
    { new: true }
  );

  if (!comment)
    return res.status(404).send("Teacher comment not found.");

  res.send(comment);
});

// DELETE COMMENT
router.delete("/:id", async (req, res) => {
  const comment = await TeacherComment.findByIdAndDelete(
    req.params.id
  );

  if (!comment)
    return res.status(404).send("Teacher comment not found.");

  res.send(comment);
});

module.exports = router;