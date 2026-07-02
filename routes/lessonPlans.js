const express = require("express");
const router = express.Router();

const { LessonPlan, validate } = require("../models/lessonPlan");
const { SchemeOfWork } = require("../models/schemeOfWork");
const { Lesson } = require("../models/lesson");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

// GET ALL LESSON PLANS
router.get("/", async (req, res) => {
  const plans = await LessonPlan.find()
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("schemeOfWork", "title term year status")
    .populate("lesson", "title")
    .sort("-createdAt");

  res.send(plans);
});

// GET LESSON PLANS BY TEACHER
router.get("/teacher/:teacherId", async (req, res) => {
  const plans = await LessonPlan.find({
    teacher: req.params.teacherId,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("schemeOfWork", "title term year status")
    .populate("lesson", "title")
    .sort("-createdAt");

  res.send(plans);
});

// GET LESSON PLANS BY CLASS
router.get("/class/:classId", async (req, res) => {
  const plans = await LessonPlan.find({
    class: req.params.classId,
  })
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("schemeOfWork", "title term year status")
    .populate("lesson", "title")
    .sort("-createdAt");

  res.send(plans);
});

// GET SINGLE LESSON PLAN
router.get("/:id", async (req, res) => {
  const plan = await LessonPlan.findById(req.params.id)
    .populate("teacher", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("schemeOfWork", "title term year status")
    .populate("lesson", "title");

  if (!plan) return res.status(404).send("Lesson plan not found.");

  res.send(plan);
});

// CREATE LESSON PLAN
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await User.findById(req.body.teacher);
  if (!teacher) return res.status(400).send("Invalid teacher.");

  if (teacher.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  if (req.body.schemeOfWork) {
    const scheme = await SchemeOfWork.findById(req.body.schemeOfWork);
    if (!scheme) return res.status(400).send("Invalid scheme of work.");
  }

  if (req.body.lesson) {
    const lesson = await Lesson.findById(req.body.lesson);
    if (!lesson) return res.status(400).send("Invalid lesson.");
  }

  const plan = new LessonPlan({
    title: req.body.title,
    schemeOfWork: req.body.schemeOfWork || undefined,
    lesson: req.body.lesson || undefined,
    teacher: req.body.teacher,
    subject: req.body.subject,
    class: req.body.class,
    date: req.body.date,
    durationMinutes: req.body.durationMinutes,
    topic: req.body.topic,
    objectives: req.body.objectives,
    introduction: req.body.introduction,
    teacherActivities: req.body.teacherActivities,
    learnerActivities: req.body.learnerActivities,
    teachingMedia: req.body.teachingMedia,
    evaluation: req.body.evaluation,
    conclusion: req.body.conclusion,
    homework: req.body.homework,
    status: req.body.status,
    adminComment: req.body.adminComment,
  });

  await plan.save();

  res.send(plan);
});

// UPDATE LESSON PLAN
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await LessonPlan.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      schemeOfWork: req.body.schemeOfWork || undefined,
      lesson: req.body.lesson || undefined,
      teacher: req.body.teacher,
      subject: req.body.subject,
      class: req.body.class,
      date: req.body.date,
      durationMinutes: req.body.durationMinutes,
      topic: req.body.topic,
      objectives: req.body.objectives,
      introduction: req.body.introduction,
      teacherActivities: req.body.teacherActivities,
      learnerActivities: req.body.learnerActivities,
      teachingMedia: req.body.teachingMedia,
      evaluation: req.body.evaluation,
      conclusion: req.body.conclusion,
      homework: req.body.homework,
      status: req.body.status,
      adminComment: req.body.adminComment,
    },
    { new: true }
  );

  if (!plan) return res.status(404).send("Lesson plan not found.");

  res.send(plan);
});

// APPROVE / REJECT LESSON PLAN
router.put("/:id/status", async (req, res) => {
  const plan = await LessonPlan.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
      adminComment: req.body.adminComment,
    },
    { new: true }
  );

  if (!plan) return res.status(404).send("Lesson plan not found.");

  res.send(plan);
});

// DELETE LESSON PLAN
router.delete("/:id", async (req, res) => {
  const plan = await LessonPlan.findByIdAndDelete(req.params.id);

  if (!plan) return res.status(404).send("Lesson plan not found.");

  res.send(plan);
});

module.exports = router;