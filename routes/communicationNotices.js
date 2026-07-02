const express = require("express");
const router = express.Router();

const {
  CommunicationNotice,
  validate,
} = require("../models/communicationNotice");

const { User } = require("../models/user");
const { Class } = require("../models/class");


router.get("/user/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("Invalid user.");

  const query = {
    status: "PUBLISHED",
    $or: [
      { audience: "ALL" },
      { audience: user.role.toUpperCase() + "S" },
    ],
  };

  const notices = await CommunicationNotice.find(query)
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(notices);
});

// GET ALL NOTICES
router.get("/", async (req, res) => {
  const notices = await CommunicationNotice.find()
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(notices);
});

// GET PUBLISHED NOTICES
router.get("/published", async (req, res) => {
  const notices = await CommunicationNotice.find({
    status: "PUBLISHED",
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(notices);
});

// GET NOTICES BY TYPE
router.get("/type/:noticeType", async (req, res) => {
  const notices = await CommunicationNotice.find({
    noticeType: req.params.noticeType.toUpperCase(),
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(notices);
});

// GET NOTICES BY CLASS
router.get("/class/:classId", async (req, res) => {
  const notices = await CommunicationNotice.find({
    class: req.params.classId,
    status: "PUBLISHED",
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(notices);
});

// GET SINGLE NOTICE
router.get("/:id", async (req, res) => {
  const notice = await CommunicationNotice.findById(req.params.id)
    .populate("sender", "name email role")
    .populate("class", "name syllabus");

  if (!notice) return res.status(404).send("Notice not found.");

  res.send(notice);
});

// CREATE NOTICE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const sender = await User.findById(req.body.sender);
  if (!sender) return res.status(400).send("Invalid sender.");

  if (req.body.class) {
    const classData = await Class.findById(req.body.class);
    if (!classData) return res.status(400).send("Invalid class.");
  }

  if (req.body.audience === "CLASS" && !req.body.class) {
    return res.status(400).send("Class is required when audience is CLASS.");
  }

  const notice = new CommunicationNotice({
    title: req.body.title,
    body: req.body.body,
    noticeType: req.body.noticeType,
    sender: req.body.sender,
    audience: req.body.audience,
    class: req.body.class || undefined,
    attachments: req.body.attachments,
    status: req.body.status,
  });

  await notice.save();

  res.send(notice);
});

// UPDATE NOTICE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const notice = await CommunicationNotice.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      body: req.body.body,
      noticeType: req.body.noticeType,
      sender: req.body.sender,
      audience: req.body.audience,
      class: req.body.class || undefined,
      attachments: req.body.attachments,
      status: req.body.status,
    },
    { new: true }
  );

  if (!notice) return res.status(404).send("Notice not found.");

  res.send(notice);
});

// PUBLISH / ARCHIVE NOTICE
router.put("/:id/status", async (req, res) => {
  const notice = await CommunicationNotice.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!notice) return res.status(404).send("Notice not found.");

  res.send(notice);
});

// DELETE NOTICE
router.delete("/:id", async (req, res) => {
  const notice = await CommunicationNotice.findByIdAndDelete(req.params.id);

  if (!notice) return res.status(404).send("Notice not found.");

  res.send(notice);
});

module.exports = router;