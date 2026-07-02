const express = require("express");
const router = express.Router();

const { Video, validate } = require("../models/video");
const { Lesson } = require("../models/lesson");

// GET ALL VIDEOS
router.get("/", async (req, res) => {
  const videos = await Video.find()
    .populate({
      path: "lesson",
      select: "title subject class teacher",
      populate: [
        { path: "subject", select: "name code level category" },
        { path: "class", select: "name syllabus" },
        { path: "teacher", select: "name email role" },
      ],
    })
    .sort("-createdAt");

  res.send(videos);
});

// GET SINGLE VIDEO
router.get("/:id", async (req, res) => {
  const video = await Video.findById(req.params.id).populate({
    path: "lesson",
    select: "title subject class teacher",
    populate: [
      { path: "subject", select: "name code level category" },
      { path: "class", select: "name syllabus" },
      { path: "teacher", select: "name email role" },
    ],
  });

  if (!video) return res.status(404).send("Video not found.");

  res.send(video);
});

// CREATE VIDEO
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const lesson = await Lesson.findById(req.body.lesson);
  if (!lesson) return res.status(400).send("Invalid lesson.");

  const video = new Video({
    lesson: req.body.lesson,
    title: req.body.title,
    description: req.body.description,
    videoUrl: req.body.videoUrl,
    thumbnailUrl: req.body.thumbnailUrl,
    duration: req.body.duration,
    is_published: req.body.is_published,
  });

  await video.save();

  res.status(201).send(video);
});

// UPDATE VIDEO
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const video = await Video.findByIdAndUpdate(
    req.params.id,
    {
      lesson: req.body.lesson,
      title: req.body.title,
      description: req.body.description,
      videoUrl: req.body.videoUrl,
      thumbnailUrl: req.body.thumbnailUrl,
      duration: req.body.duration,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!video) return res.status(404).send("Video not found.");

  res.send(video);
});

// DELETE VIDEO
router.delete("/:id", async (req, res) => {
  const video = await Video.findByIdAndDelete(req.params.id);

  if (!video) return res.status(404).send("Video not found.");

  res.send(video);
});

module.exports = router;