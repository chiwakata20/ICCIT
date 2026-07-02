const express = require("express");
const router = express.Router();

const {
  LibraryResource,
  validate,
} = require("../models/libraryResource");

const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Attachment } = require("../models/attachment");

// GET ALL LIBRARY RESOURCES
router.get("/", async (req, res) => {
  const resources = await LibraryResource.find()
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("uploadedBy", "name email role")
    .populate("attachment", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(resources);
});

// SEARCH AND FILTER LIBRARY
router.get("/search", async (req, res) => {
  const { q, syllabus, resourceType, subject, classId } = req.query;

  const filter = {
    is_published: true,
  };

  if (syllabus) filter.syllabus = syllabus;
  if (resourceType) filter.resourceType = resourceType;
  if (subject) filter.subject = subject;
  if (classId) filter.class = classId;

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  const resources = await LibraryResource.find(filter)
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("uploadedBy", "name email role")
    .populate("attachment", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(resources);
});

// GET RESOURCES BY SUBJECT
router.get("/subject/:subjectId", async (req, res) => {
  const resources = await LibraryResource.find({
    subject: req.params.subjectId,
    is_published: true,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("uploadedBy", "name email role")
    .populate("attachment", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(resources);
});

// GET RESOURCES BY CLASS
router.get("/class/:classId", async (req, res) => {
  const resources = await LibraryResource.find({
    class: req.params.classId,
    is_published: true,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("uploadedBy", "name email role")
    .populate("attachment", "originalName filePath fileType fileSize")
    .sort("-createdAt");

  res.send(resources);
});

// GET SINGLE RESOURCE
router.get("/:id", async (req, res) => {
  const resource = await LibraryResource.findById(req.params.id)
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("uploadedBy", "name email role")
    .populate("attachment", "originalName filePath fileType fileSize");

  if (!resource) return res.status(404).send("Library resource not found.");

  res.send(resource);
});

// CREATE LIBRARY RESOURCE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const uploadedBy = await User.findById(req.body.uploadedBy);
  if (!uploadedBy) return res.status(400).send("Invalid uploadedBy user.");

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  if (req.body.class) {
    const classData = await Class.findById(req.body.class);
    if (!classData) return res.status(400).send("Invalid class.");
  }

  const attachment = await Attachment.findById(req.body.attachment);
  if (!attachment) return res.status(400).send("Invalid attachment.");

  const resource = new LibraryResource({
    title: req.body.title,
    description: req.body.description,
    resourceType: req.body.resourceType,
    syllabus: req.body.syllabus,
    subject: req.body.subject,
    class: req.body.class || undefined,
    uploadedBy: req.body.uploadedBy,
    attachment: req.body.attachment,
    tags: req.body.tags,
    is_published: req.body.is_published,
  });

  await resource.save();

  res.send(resource);
});

// UPDATE LIBRARY RESOURCE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const resource = await LibraryResource.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      description: req.body.description,
      resourceType: req.body.resourceType,
      syllabus: req.body.syllabus,
      subject: req.body.subject,
      class: req.body.class || undefined,
      uploadedBy: req.body.uploadedBy,
      attachment: req.body.attachment,
      tags: req.body.tags,
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!resource) return res.status(404).send("Library resource not found.");

  res.send(resource);
});

// PUBLISH / UNPUBLISH
router.put("/:id/status", async (req, res) => {
  const resource = await LibraryResource.findByIdAndUpdate(
    req.params.id,
    {
      is_published: req.body.is_published,
    },
    { new: true }
  );

  if (!resource) return res.status(404).send("Library resource not found.");

  res.send(resource);
});

// DELETE LIBRARY RESOURCE
router.delete("/:id", async (req, res) => {
  const resource = await LibraryResource.findByIdAndDelete(req.params.id);

  if (!resource) return res.status(404).send("Library resource not found.");

  res.send(resource);
});

module.exports = router;