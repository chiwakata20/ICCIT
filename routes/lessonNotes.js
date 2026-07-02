const express = require("express");
const router = express.Router();

const { LessonNote, validate } = require("../models/lessonNote");
const { Lesson } = require("../models/lesson");

// GET ALL LESSON NOTES
router.get("/", async (req, res) => {
  const notes = await LessonNote.find()
    .populate({
      path: "lesson",
      select: "title subject class teacher",
      populate: [
        { path: "subject", select: "name code level category" },
        { path: "class", select: "name syllabus" },
        { path: "teacher", select: "name email role" },
      ],
    })
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(notes);
});

// GET SINGLE LESSON NOTE
router.get("/:id", async (req, res) => {
  const note = await LessonNote.findById(req.params.id).populate({
    path: "lesson",
    select: "title subject class teacher",
    populate: [
      { path: "subject", select: "name code level category" },
      { path: "class", select: "name syllabus" },
      { path: "teacher", select: "name email role" },
    ],
  })
  .populate("attachments", "originalName filePath fileType fileSize");

  if (!note) return res.status(404).send("Lesson note not found.");

  res.send(note);
});

// CREATE LESSON NOTE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lesson = await Lesson.findById(req.body.lesson);
  if (!lesson) return res.status(400).send("Invalid lesson.");

  const note = new LessonNote({
    lesson: req.body.lesson,
    title: req.body.title,
    content: req.body.content,
    pdfUrl: req.body.pdfUrl,
    attachments: req.body.attachments,
    is_published: req.body.is_published,
  });

  await note.save();

  res.status(201).send(note);
});

// UPDATE LESSON NOTE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const note = await LessonNote.findByIdAndUpdate(
    req.params.id,
    {
      lesson: req.body.lesson,
      title: req.body.title,
      content: req.body.content,
      pdfUrl: req.body.pdfUrl,
      attachments: req.body.attachments,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!note) return res.status(404).send("Lesson note not found.");

  res.send(note);
});

// DELETE LESSON NOTE
router.delete("/:id", async (req, res) => {
  const note = await LessonNote.findByIdAndDelete(req.params.id);

  if (!note) return res.status(404).send("Lesson note not found.");

  res.send(note);
});

module.exports = router;