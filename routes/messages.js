const express = require("express");
const router = express.Router();

const { Message, validate } = require("../models/message");
const { User } = require("../models/user");

// GET ALL MESSAGES
router.get("/", async (req, res) => {
  const messages = await Message.find()
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(messages);
});

// GET INBOX BY USER
router.get("/inbox/:userId", async (req, res) => {
  const messages = await Message.find({
    recipient: req.params.userId,
  })
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(messages);
});

// GET SENT MESSAGES BY USER
router.get("/sent/:userId", async (req, res) => {
  const messages = await Message.find({
    sender: req.params.userId,
  })
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(messages);
});

// GET SINGLE MESSAGE
router.get("/:id", async (req, res) => {
  const message = await Message.findById(req.params.id)
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate("attachments", "originalName filePath fileType fileSize");

  if (!message) return res.status(404).send("Message not found.");

  res.send(message);
});

// SEND MESSAGE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sender = await User.findById(req.body.sender);
  if (!sender) return res.status(400).send("Invalid sender.");

  const recipient = await User.findById(req.body.recipient);
  if (!recipient) return res.status(400).send("Invalid recipient.");

  const message = new Message({
    sender: req.body.sender,
    recipient: req.body.recipient,
    subject: req.body.subject,
    message: req.body.message,
    attachments: req.body.attachments,
  });

  await message.save();

  res.send(message);
});

// MARK MESSAGE AS READ
router.put("/:id/read", async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    {
      is_read: true,
      readAt: new Date(),
    },
    { new: true }
  );

  if (!message) return res.status(404).send("Message not found.");

  res.send(message);
});

// DELETE MESSAGE
router.delete("/:id", async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);

  if (!message) return res.status(404).send("Message not found.");

  res.send(message);
});

module.exports = router;