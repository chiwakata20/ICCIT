const express = require("express");
const router = express.Router();

const { Announcement, validate } = require("../models/announcement");
const { User } = require("../models/user");
const { Class } = require("../models/class");
const { StudentProfile } = require("../models/studentProfile");
const { TeacherProfile } = require("../models/teacherProfile");




// GET ALL ANNOUNCEMENTS
router.get("/", async (req, res) => {
  const announcements = await Announcement.find()
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(announcements);
});

router.get("/user/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(400).send("Invalid user.");

  let userClassIds = [];

  if (user.role === "student") {
    const studentProfile = await StudentProfile.findOne({
      user: user._id,
    });

    if (studentProfile && studentProfile.class) {
      userClassIds.push(studentProfile.class);
    }
  }

  if (user.role === "teacher") {
    const teacherProfile = await TeacherProfile.findOne({
      user: user._id,
    });

    if (teacherProfile && teacherProfile.classes) {
      userClassIds = teacherProfile.classes;
    }
  }

  const roleAudience = user.role.toUpperCase() + "S";

  const announcements = await Announcement.find({
    is_published: true,
    $or: [
      { audience: "ALL" },
      { audience: roleAudience },
      {
        audience: "CLASS",
        class: { $in: userClassIds },
      },
    ],
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(announcements);
});



// GET ANNOUNCEMENTS BY AUDIENCE
router.get("/audience/:audience", async (req, res) => {
  const announcements = await Announcement.find({
    audience: req.params.audience.toUpperCase(),
    is_published: true,
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(announcements);
});

// GET ANNOUNCEMENTS BY CLASS
router.get("/class/:classId", async (req, res) => {
  const announcements = await Announcement.find({
    class: req.params.classId,
    is_published: true,
  })
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(announcements);
});

// GET SINGLE ANNOUNCEMENT
router.get("/:id", async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate("sender", "name email role")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize");

  if (!announcement) return res.status(404).send("Announcement not found.");

  res.send(announcement);
});

// CREATE ANNOUNCEMENT
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

  const announcement = new Announcement({
    title: req.body.title,
    message: req.body.message,
    sender: req.body.sender,
    audience: req.body.audience,
    class: req.body.class || undefined,
    priority: req.body.priority,
    attachments: req.body.attachments,
    is_published: req.body.is_published,
  });

  await announcement.save();

  res.send(announcement);
});

// UPDATE ANNOUNCEMENT
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const announcement = await Announcement.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      message: req.body.message,
      sender: req.body.sender,
      audience: req.body.audience,
      class: req.body.class || undefined,
      priority: req.body.priority,
      attachments: req.body.attachments,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!announcement) return res.status(404).send("Announcement not found.");

  res.send(announcement);
});

// DELETE ANNOUNCEMENT
router.delete("/:id", async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) return res.status(404).send("Announcement not found.");

  res.send(announcement);
});

module.exports = router;