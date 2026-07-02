const express = require("express");
const router = express.Router();

const { Class, validate } = require("../models/class");
const { User } = require("../models/user");

// GET ALL CLASSES
router.get("/", async (req, res) => {
  const classes = await Class.find()
    .populate("teacher", "name email role")
    .populate("students", "name email role")
    .sort("name");

  res.send(classes);
});

// GET SINGLE CLASS
router.get("/:id", async (req, res) => {
  const classData = await Class.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("students", "name email role");

  if (!classData) return res.status(404).send("Class not found.");

  res.send(classData);
});

// CREATE CLASS
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const classData = new Class({
    name: req.body.name,
    syllabus: req.body.syllabus,
    students: req.body.students,
    teacher: req.body.teacher,
  });

  await classData.save();

  res.send(classData);
});

// UPDATE CLASS
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classData = await Class.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      syllabus: req.body.syllabus,
      students: req.body.students,
      teacher: req.body.teacher,
    },
    { new: true }
  );

  if (!classData) return res.status(404).send("Class not found.");

  res.send(classData);
});

// DELETE CLASS
router.delete("/:id", async (req, res) => {
  const classData = await Class.findByIdAndDelete(req.params.id);

  if (!classData) return res.status(404).send("Class not found.");

  res.send(classData);
});

module.exports = router;