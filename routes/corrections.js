const express = require("express");
const router = express.Router();

const { Correction, validate } = require("../models/correction");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Attachment } = require("../models/attachment");
const { Message } = require("../models/message");

// GET ALL CORRECTIONS
router.get("/", async (req, res) => {
  const corrections = await Correction.find()
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(corrections);
});

// GET CORRECTIONS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const corrections = await Correction.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(corrections);
});

// GET CORRECTIONS BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const corrections = await Correction.find({
    teacher: req.params.teacherId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(corrections);
});

// GET CORRECTIONS BY STATUS
router.get("/status/:status", async (req, res) => {
  const corrections = await Correction.find({
    status: req.params.status.toUpperCase(),
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(corrections);
});

// GET SINGLE CORRECTION
router.get("/:id", async (req, res) => {
  const correction = await Correction.findById(req.params.id)
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize");

  if (!correction) return res.status(404).send("Correction not found.");

  res.send(correction);
});

// CREATE CORRECTION
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  if (req.body.attachments && req.body.attachments.length > 0) {
    for (const attachmentId of req.body.attachments) {
      const attachment = await Attachment.findById(attachmentId);
      if (!attachment) return res.status(400).send("Invalid attachment.");
    }
  }

  const correction = new Correction({
    student: req.body.student,
    teacher: req.body.teacher,
    subject: req.body.subject,
    class: req.body.class,
    correctionType: req.body.correctionType,
    relatedModel: req.body.relatedModel,
    relatedId: req.body.relatedId || undefined,
    title: req.body.title,
    mistakeDescription: req.body.mistakeDescription,
    correctedAnswer: req.body.correctedAnswer,
    attachments: req.body.attachments,
    status: req.body.status,
    teacherFeedback: req.body.teacherFeedback,
  });

  await correction.save();

  res.send(correction);
});

// UPDATE CORRECTION
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const correction = await Correction.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      teacher: req.body.teacher,
      subject: req.body.subject,
      class: req.body.class,
      correctionType: req.body.correctionType,
      relatedModel: req.body.relatedModel,
      relatedId: req.body.relatedId || undefined,
      title: req.body.title,
      mistakeDescription: req.body.mistakeDescription,
      correctedAnswer: req.body.correctedAnswer,
      attachments: req.body.attachments,
      status: req.body.status,
      teacherFeedback: req.body.teacherFeedback,
    },
    { new: true }
  );

  if (!correction) return res.status(404).send("Correction not found.");

  res.send(correction);
});

// TEACHER REVIEW CORRECTION
router.put("/:id/review", async (req, res) => {
  const correction = await Correction.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      teacherFeedback: req.body.teacherFeedback,
      reviewedAt: new Date(),
    },
    { new: true }
  )
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("attachments", "originalName filePath fileType fileSize");

  if (!correction) return res.status(404).send("Correction not found.");

  const message = new Message({
    sender: correction.teacher._id,
    recipient: correction.student._id,
    subject: "Correction Reviewed",
    message: `Your correction "${correction.title}" has been reviewed. Status: ${correction.status}. Feedback: ${correction.teacherFeedback || "No feedback provided."}`,
  });

  await message.save();

  res.send({
    correction,
    notification: message,
  });
});

// DELETE CORRECTION
router.delete("/:id", async (req, res) => {
  const correction = await Correction.findByIdAndDelete(req.params.id);

  if (!correction) return res.status(404).send("Correction not found.");

  res.send(correction);
});

module.exports = router;