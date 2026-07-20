const express = require("express");
const router = express.Router();

const { Timetable, validate } = require("../models/timeTable");
const { Class } = require("../models/class");
const { Subject } = require("../models/subject");
const { User } = require("../models/user");

// GET ALL TIMETABLES
router.get("/", async (req, res) => {
  const timetables = await Timetable.find()
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("teacher", "name email role")
    .sort("day startTime");

  res.send(timetables);
});

// GET TIMETABLE BY CLASS
router.get("/class/:classId", async (req, res) => {
  const timetables = await Timetable.find({
    class: req.params.classId,
    is_active: true,
  })
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("teacher", "name email role")
    .sort("day startTime");

  res.send(timetables);
});

// GET TIMETABLE BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const timetables = await Timetable.find({
    teacher: req.params.teacherId,
    is_active: true,
  })
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("teacher", "name email role")
    .sort("day startTime");

  res.send(timetables);
});

// GET TIMETABLE BY DAY
router.get("/day/:day", async (req, res) => {
  const timetables = await Timetable.find({
    day: req.params.day.toUpperCase(),
    is_active: true,
  })
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("teacher", "name email role")
    .sort("startTime");

  res.send(timetables);
});

// GET SINGLE TIMETABLE
router.get("/:id", async (req, res) => {
  const timetable = await Timetable.findById(req.params.id)
    .populate("class", "name syllabus")
    .populate("subject", "name code level category")
    .populate("teacher", "name email role");

  if (!timetable) return res.status(404).send("Timetable record not found.");

  res.send(timetable);
});

// CREATE TIMETABLE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const existingClassSlot = await Timetable.findOne({
    class: req.body.class,
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  });

  if (existingClassSlot) {
    return res.status(400).send("This class already has a lesson at this time.");
  }

  const existingTeacherSlot = await Timetable.findOne({
    teacher: req.body.teacher,
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
  });

  if (existingTeacherSlot) {
    return res.status(400).send("This teacher already has a lesson at this time.");
  }

  const timetable = new Timetable({
    class: req.body.class,
    subject: req.body.subject,
    teacher: req.body.teacher,
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    room: req.body.room,
    lessonType: req.body.lessonType,
    is_active: req.body.is_active,
  });

  await timetable.save();

  res.send(timetable);
});

// UPDATE TIMETABLE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const timetable = await Timetable.findByIdAndUpdate(
    req.params.id,
    {
      class: req.body.class,
      subject: req.body.subject,
      teacher: req.body.teacher,
      day: req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      room: req.body.room,
      lessonType: req.body.lessonType,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!timetable) return res.status(404).send("Timetable record not found.");

  res.send(timetable);
});

// DELETE TIMETABLE
router.delete("/:id", async (req, res) => {
  const timetable = await Timetable.findByIdAndDelete(req.params.id);

  if (!timetable) return res.status(404).send("Timetable record not found.");

  res.send(timetable);
});

module.exports = router;