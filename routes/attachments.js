const express = require("express");
const router = express.Router();

const upload = require("../middleware/attachmentUpload");
const { Attachment, validate } = require("../models/attachment");
const { User } = require("../models/user");

// UPLOAD SINGLE FILE
router.post("/single", upload.single("file"), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!req.file) return res.status(400).send("No file uploaded.");

  const user = await User.findById(req.body.uploadedBy);
  if (!user) return res.status(400).send("Invalid uploadedBy user.");

  const attachment = new Attachment({
    originalName: req.file.originalname,
    fileName: req.file.filename,
    filePath: req.file.path,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    uploadedBy: req.body.uploadedBy,
    relatedModel: req.body.relatedModel,
    relatedId: req.body.relatedId || undefined,
  });

  await attachment.save();

  res.send(attachment);
});

// UPLOAD MULTIPLE FILES
router.post("/multiple", upload.array("files", 10), async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }

  const user = await User.findById(req.body.uploadedBy);
  if (!user) return res.status(400).send("Invalid uploadedBy user.");

  const attachments = [];

  for (const file of req.files) {
    const attachment = new Attachment({
      originalName: file.originalname,
      fileName: file.filename,
      filePath: file.path,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadedBy: req.body.uploadedBy,
      relatedModel: req.body.relatedModel,
      relatedId: req.body.relatedId || undefined,
    });

    await attachment.save();
    attachments.push(attachment);
  }

  res.send(attachments);
});

// GET ALL ATTACHMENTS
router.get("/", async (req, res) => {
  const attachments = await Attachment.find()
    .populate("uploadedBy", "name email role")
    .sort("-createdAt");

  res.send(attachments);
});

// GET ATTACHMENTS BY RELATED RECORD
router.get("/related/:relatedModel/:relatedId", async (req, res) => {
  const attachments = await Attachment.find({
    relatedModel: req.params.relatedModel,
    relatedId: req.params.relatedId,
  })
    .populate("uploadedBy", "name email role")
    .sort("-createdAt");

  res.send(attachments);
});

// GET SINGLE ATTACHMENT
router.get("/:id", async (req, res) => {
  const attachment = await Attachment.findById(req.params.id)
    .populate("uploadedBy", "name email role");

  if (!attachment) return res.status(404).send("Attachment not found.");

  res.send(attachment);
});

// DELETE ATTACHMENT RECORD
router.delete("/:id", async (req, res) => {
  const attachment = await Attachment.findByIdAndDelete(req.params.id);

  if (!attachment) return res.status(404).send("Attachment not found.");

  res.send(attachment);
});

module.exports = router;