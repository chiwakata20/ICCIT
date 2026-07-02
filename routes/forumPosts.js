const express = require("express");
const router = express.Router();

const { ForumPost, validate } = require("../models/forumPost");
const { ForumTopic } = require("../models/forumTopic");
const { User } = require("../models/user");
const { Attachment } = require("../models/attachment");

// GET ALL POSTS
router.get("/", async (req, res) => {
  const posts = await ForumPost.find({ is_deleted: false })
    .populate("topic", "title status visibility")
    .populate("author", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .populate("parentPost", "content author")
    .sort("-createdAt");

  res.send(posts);
});

// GET POSTS BY TOPIC
router.get("/topic/:topicId", async (req, res) => {
  const posts = await ForumPost.find({
    topic: req.params.topicId,
    is_deleted: false,
  })
    .populate("author", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .populate("parentPost", "content author")
    .sort("createdAt");

  res.send(posts);
});

// GET POSTS BY AUTHOR
router.get("/author/:authorId", async (req, res) => {
  const posts = await ForumPost.find({
    author: req.params.authorId,
    is_deleted: false,
  })
    .populate("topic", "title status visibility")
    .populate("author", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(posts);
});

// GET SINGLE POST
router.get("/:id", async (req, res) => {
  const post = await ForumPost.findById(req.params.id)
    .populate("topic", "title status visibility")
    .populate("author", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .populate("parentPost", "content author")
    .populate("likes", "name email role");

  if (!post || post.is_deleted) return res.status(404).send("Forum post not found.");

  res.send(post);
});

// CREATE POST / REPLY
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const topic = await ForumTopic.findById(req.body.topic);
  if (!topic) return res.status(400).send("Invalid topic.");

  if (topic.status !== "OPEN") {
    return res.status(400).send("This topic is not open for discussion.");
  }

  const author = await User.findById(req.body.author);
  if (!author) return res.status(400).send("Invalid author.");

  if (req.body.parentPost) {
    const parentPost = await ForumPost.findById(req.body.parentPost);
    if (!parentPost) return res.status(400).send("Invalid parent post.");
  }

  if (req.body.attachments && req.body.attachments.length > 0) {
    for (const attachmentId of req.body.attachments) {
      const attachment = await Attachment.findById(attachmentId);
      if (!attachment) return res.status(400).send("Invalid attachment.");
    }
  }

  const post = new ForumPost({
    topic: req.body.topic,
    author: req.body.author,
    content: req.body.content,
    attachments: req.body.attachments,
    parentPost: req.body.parentPost || undefined,
    is_answer: req.body.is_answer,
  });

  await post.save();

  res.send(post);
});

// UPDATE POST
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    {
      topic: req.body.topic,
      author: req.body.author,
      content: req.body.content,
      attachments: req.body.attachments,
      parentPost: req.body.parentPost || undefined,
      is_answer: req.body.is_answer,
    },
    { new: true }
  );

  if (!post) return res.status(404).send("Forum post not found.");

  res.send(post);
});

// LIKE / UNLIKE POST
router.put("/:id/like", async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post || post.is_deleted) return res.status(404).send("Forum post not found.");

  const user = await User.findById(req.body.user);
  if (!user) return res.status(400).send("Invalid user.");

  const alreadyLiked = post.likes.some(
    (id) => id.toString() === req.body.user
  );

  if (alreadyLiked) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.body.user
    );
  } else {
    post.likes.push(req.body.user);
  }

  await post.save();

  res.send(post);
});

// SOFT DELETE POST
router.delete("/:id", async (req, res) => {
  const post = await ForumPost.findByIdAndUpdate(
    req.params.id,
    {
      is_deleted: true,
    },
    { new: true }
  );

  if (!post) return res.status(404).send("Forum post not found.");

  res.send(post);
});

module.exports = router;