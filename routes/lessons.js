const express = require("express");
const router = express.Router();

const { Lesson, validate } = require("../models/lesson");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

// GET ALL LESSONS
router.get("/", async (req, res) => {
  const lessons = await Lesson.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(lessons);
});

// GET SINGLE LESSON
router.get("/:id", async (req, res) => {
  const lesson = await Lesson.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!lesson) return res.status(404).send("Lesson not found.");

  res.send(lesson);
});

// CREATE LESSON
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

  const lesson = new Lesson({
    title: req.body.title,
    subject: req.body.subject,
    class: req.body.class,
    teacher: req.body.teacher,
    content: req.body.content,
    videoUrl: req.body.videoUrl,
    attachments: req.body.attachments,
    is_published: req.body.is_published,
  });

  await lesson.save();

  res.send(lesson);
});

// UPDATE LESSON
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      subject: req.body.subject,
      class: req.body.class,
      teacher: req.body.teacher,
      content: req.body.content,
      videoUrl: req.body.videoUrl,
      attachments: req.body.attachments,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!lesson) return res.status(404).send("Lesson not found.");

  res.send(lesson);
});

// DELETE LESSON
router.delete("/:id", async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);

  if (!lesson) return res.status(404).send("Lesson not found.");

  res.send(lesson);
});

module.exports = router;