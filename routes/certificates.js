const express = require("express");
const router = express.Router();

const { Certificate, validate } = require("../models/certificate");
const { User } = require("../models/user");
const { Class } = require("../models/class");
const { Subject } = require("../models/subject");
const { Attachment } = require("../models/attachment");

// GET ALL CERTIFICATES
router.get("/", async (req, res) => {
  const certificates = await Certificate.find()
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("issuedBy", "name email role")
    .populate("certificateFile", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(certificates);
});

// GET CERTIFICATES BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const certificates = await Certificate.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("issuedBy", "name email role")
    .populate("certificateFile", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(certificates);
});

// GET ISSUED CERTIFICATES BY STUDENT
router.get("/student/:studentId/issued", async (req, res) => {
  const certificates = await Certificate.find({
    student: req.params.studentId,
    status: "ISSUED",
  })
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("issuedBy", "name email role")
    .populate("certificateFile", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(certificates);
});

// GET SINGLE CERTIFICATE
router.get("/:id", async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate("student", "name email role")
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("issuedBy", "name email role")
    .populate("certificateFile", "originalName filePath fileType fileSize");

  if (!certificate) return res.status(404).send("Certificate not found.");

  res.send(certificate);
});

// CREATE CERTIFICATE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const issuedBy = await User.findById(req.body.issuedBy);
  if (!issuedBy) return res.status(400).send("Invalid issuedBy user.");

  if (req.body.class) {
    const classData = await Class.findById(req.body.class);
    if (!classData) return res.status(400).send("Invalid class.");
  }

  if (req.body.subject) {
    const subject = await Subject.findById(req.body.subject);
    if (!subject) return res.status(400).send("Invalid subject.");
  }

  if (req.body.certificateFile) {
    const attachment = await Attachment.findById(req.body.certificateFile);
    if (!attachment) return res.status(400).send("Invalid certificate file.");
  }

  const certificate = new Certificate({
    student: req.body.student,
    class: req.body.class || undefined,
    subject: req.body.subject || undefined,
    title: req.body.title,
    description: req.body.description,
    certificateType: req.body.certificateType,
    issuedBy: req.body.issuedBy,
    issueDate: req.body.issueDate,
    certificateFile: req.body.certificateFile || undefined,
    status: req.body.status,
  });

  await certificate.save();

  res.send(certificate);
});

// UPDATE CERTIFICATE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const certificate = await Certificate.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      class: req.body.class || undefined,
      subject: req.body.subject || undefined,
      title: req.body.title,
      description: req.body.description,
      certificateType: req.body.certificateType,
      issuedBy: req.body.issuedBy,
      issueDate: req.body.issueDate,
      certificateFile: req.body.certificateFile || undefined,
      status: req.body.status,
    },
    { new: true }
  );

  if (!certificate) return res.status(404).send("Certificate not found.");

  res.send(certificate);
});

// CHANGE CERTIFICATE STATUS
router.put("/:id/status", async (req, res) => {
  const certificate = await Certificate.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!certificate) return res.status(404).send("Certificate not found.");

  res.send(certificate);
});

// DELETE CERTIFICATE
router.delete("/:id", async (req, res) => {
  const certificate = await Certificate.findByIdAndDelete(req.params.id);

  if (!certificate) return res.status(404).send("Certificate not found.");

  res.send(certificate);
});

module.exports = router;