const express = require("express");
const router = express.Router();

const { StudentBadge, validate } = require("../models/studentBadge");
const { Badge } = require("../models/badge");
const { User } = require("../models/user");
const { Class } = require("../models/class");
const { Subject } = require("../models/subject");

// GET ALL STUDENT BADGES
router.get("/", async (req, res) => {
  const studentBadges = await StudentBadge.find()
    .populate("student", "name email role")
    .populate("badge", "name description badgeType iconUrl")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("awardedBy", "name email role")
    .sort("-createdAt");

  res.send(studentBadges);
});

// GET BADGES BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const studentBadges = await StudentBadge.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("badge", "name description badgeType iconUrl")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("awardedBy", "name email role")
    .sort("-createdAt");

  res.send(studentBadges);
});

// GET SINGLE STUDENT BADGE
router.get("/:id", async (req, res) => {
  const studentBadge = await StudentBadge.findById(req.params.id)
    .populate("student", "name email role")
    .populate("badge", "name description badgeType iconUrl")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("awardedBy", "name email role");

  if (!studentBadge) return res.status(404).send("Student badge not found.");

  res.send(studentBadge);
});

// AWARD BADGE TO STUDENT
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const badge = await Badge.findById(req.body.badge);
  if (!badge) return res.status(400).send("Invalid badge.");

  const awardedBy = await User.findById(req.body.awardedBy);
  if (!awardedBy) return res.status(400).send("Invalid awardedBy user.");

  if (req.body.class) {
    const classData = await Class.findById(req.body.class);
    if (!classData) return res.status(400).send("Invalid class.");
  }

  if (req.body.subject) {
    const subject = await Subject.findById(req.body.subject);
    if (!subject) return res.status(400).send("Invalid subject.");
  }

  const studentBadge = new StudentBadge({
    student: req.body.student,
    badge: req.body.badge,
    class: req.body.class || undefined,
    subject: req.body.subject || undefined,
    awardedBy: req.body.awardedBy,
    reason: req.body.reason,
    awardedAt: req.body.awardedAt,
  });

  await studentBadge.save();

  res.send(studentBadge);
});

// UPDATE STUDENT BADGE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const studentBadge = await StudentBadge.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      badge: req.body.badge,
      class: req.body.class || undefined,
      subject: req.body.subject || undefined,
      awardedBy: req.body.awardedBy,
      reason: req.body.reason,
      awardedAt: req.body.awardedAt,
    },
    { new: true }
  );

  if (!studentBadge) return res.status(404).send("Student badge not found.");

  res.send(studentBadge);
});

// DELETE STUDENT BADGE
router.delete("/:id", async (req, res) => {
  const studentBadge = await StudentBadge.findByIdAndDelete(req.params.id);

  if (!studentBadge) return res.status(404).send("Student badge not found.");

  res.send(studentBadge);
});

module.exports = router;