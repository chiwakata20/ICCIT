const express = require("express");
const router = express.Router();

const { ForumTopic, validate } = require("../models/forumTopic");
const { ForumPost } = require("../models/forumPost");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

// GET ALL TOPICS
router.get("/", async (req, res) => {
  const topics = await ForumTopic.find()
    .populate("createdBy", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(topics);
});

// GET TOPICS BY CLASS
router.get("/class/:classId", async (req, res) => {
  const topics = await ForumTopic.find({
    class: req.params.classId,
    status: { $ne: "ARCHIVED" },
  })
    .populate("createdBy", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(topics);
});

// GET TOPICS BY SUBJECT
router.get("/subject/:subjectId", async (req, res) => {
  const topics = await ForumTopic.find({
    subject: req.params.subjectId,
    status: { $ne: "ARCHIVED" },
  })
    .populate("createdBy", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(topics);
});

// SEARCH TOPICS
router.get("/search", async (req, res) => {
  const { q, visibility, status } = req.query;

  const filter = {};

  if (visibility) filter.visibility = visibility;
  if (status) filter.status = status;

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  const topics = await ForumTopic.find(filter)
    .populate("createdBy", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(topics);
});

// GET SINGLE TOPIC WITH POSTS
router.get("/:id", async (req, res) => {
  const topic = await ForumTopic.findById(req.params.id)
    .populate("createdBy", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!topic) return res.status(404).send("Forum topic not found.");

  const posts = await ForumPost.find({
    topic: req.params.id,
    is_deleted: false,
  })
    .populate("author", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .populate("parentPost", "content author")
    .sort("createdAt");

  res.send({
    topic,
    posts,
  });
});

// CREATE TOPIC
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.createdBy);
  if (!user) return res.status(400).send("Invalid user.");

  if (req.body.subject) {
    const subject = await Subject.findById(req.body.subject);
    if (!subject) return res.status(400).send("Invalid subject.");
  }

  if (req.body.class) {
    const classData = await Class.findById(req.body.class);
    if (!classData) return res.status(400).send("Invalid class.");
  }

  if (req.body.visibility === "CLASS" && !req.body.class) {
    return res.status(400).send("Class is required when visibility is CLASS.");
  }

  if (req.body.visibility === "SUBJECT" && !req.body.subject) {
    return res.status(400).send("Subject is required when visibility is SUBJECT.");
  }

  const topic = new ForumTopic({
    title: req.body.title,
    description: req.body.description,
    subject: req.body.subject || undefined,
    class: req.body.class || undefined,
    createdBy: req.body.createdBy,
    visibility: req.body.visibility,
    status: req.body.status,
  });

  await topic.save();

  res.send(topic);
});

// UPDATE TOPIC
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const topic = await ForumTopic.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject || undefined,
      class: req.body.class || undefined,
      createdBy: req.body.createdBy,
      visibility: req.body.visibility,
      status: req.body.status,
    },
    { new: true }
  );

  if (!topic) return res.status(404).send("Forum topic not found.");

  res.send(topic);
});

// CLOSE / OPEN / ARCHIVE TOPIC
router.put("/:id/status", async (req, res) => {
  const topic = await ForumTopic.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!topic) return res.status(404).send("Forum topic not found.");

  res.send(topic);
});

// DELETE TOPIC
router.delete("/:id", async (req, res) => {
  const topic = await ForumTopic.findByIdAndDelete(req.params.id);

  if (!topic) return res.status(404).send("Forum topic not found.");

  res.send(topic);
});

module.exports = router;