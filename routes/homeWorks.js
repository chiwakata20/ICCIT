const express = require("express");
const router = express.Router();

const { Homework, validate } = require("../models/homework");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Lesson } = require("../models/lesson");
const { HomeworkSubmission } = require("../models/homeworkSubmission");

// GET ALL HOMEWORKS
router.get("/", async (req, res) => {
  const homeworks = await Homework.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(homeworks);
});

// GET HOMEWORK BY CLASS
router.get("/class/:classId", async (req, res) => {
  const homeworks = await Homework.find({
    class: req.params.classId,
    is_active: true,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(homeworks);
});

// GET HOMEWORK BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const homeworks = await Homework.find({
    teacher: req.params.teacherId,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(homeworks);
});

// GET PUBLISHED HOMEWORK BY CLASS
router.get("/class/:classId/published", async (req, res) => {
  const homeworks = await Homework.find({
    class: req.params.classId,
    status: "PUBLISHED",
    is_active: true,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .populate("lesson", "title")
    .sort("-createdAt");

  res.send(homeworks);
});

// GET HOMEWORK COMPLETION SUMMARY
router.get("/:id/summary", async (req, res) => {
  const homework = await Homework.findById(req.params.id)
    .populate("class", "name syllabus")
    .populate("subject", "name code")
    .populate("teacher", "name email");

  if (!homework) return res.status(404).send("Homework not found.");

  const submissions = await HomeworkSubmission.find({
    homework: req.params.id,
  }).populate("student", "name email role");

  const submitted = submissions.filter(
    (item) =>
      item.status === "SUBMITTED" ||
      item.status === "MARKED" ||
      item.status === "LATE"
  ).length;

  const marked = submissions.filter((item) => item.status === "MARKED").length;
  const late = submissions.filter((item) => item.status === "LATE").length;

  res.send({
    homework,
    totalSubmissions: submissions.length,
    submitted,
    marked,
    late,
    submissions,
  });
});

// GET SINGLE HOMEWORK
router.get("/:id", async (req, res) => {
  const homework = await Homework.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title");

  if (!homework) return res.status(404).send("Homework not found.");

  res.send(homework);
});

// CREATE HOMEWORK
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

  if (req.body.lesson) {
    const lesson = await Lesson.findById(req.body.lesson);
    if (!lesson) return res.status(400).send("Invalid lesson.");
  }

  const homework = new Homework({
    title: req.body.title,
    subject: req.body.subject,
    class: req.body.class,
    teacher: req.body.teacher,
    lesson: req.body.lesson || undefined,
    instructions: req.body.instructions,
    attachments: req.body.attachments,
    dueDate: req.body.dueDate,
    totalMarks: req.body.totalMarks,
    status: req.body.status,
    is_active: req.body.is_active,
  });

  await homework.save();

  res.send(homework);
});

// UPDATE HOMEWORK
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const homework = await Homework.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      subject: req.body.subject,
      class: req.body.class,
      teacher: req.body.teacher,
      lesson: req.body.lesson || undefined,
      instructions: req.body.instructions,
      attachments: req.body.attachments,
      dueDate: req.body.dueDate,
      totalMarks: req.body.totalMarks,
      status: req.body.status,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!homework) return res.status(404).send("Homework not found.");

  res.send(homework);
});

// PUBLISH / CLOSE HOMEWORK
router.put("/:id/status", async (req, res) => {
  const homework = await Homework.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!homework) return res.status(404).send("Homework not found.");

  res.send(homework);
});

// DELETE HOMEWORK
router.delete("/:id", async (req, res) => {
  const homework = await Homework.findByIdAndDelete(req.params.id);

  if (!homework) return res.status(404).send("Homework not found.");

  res.send(homework);
});

module.exports = router;