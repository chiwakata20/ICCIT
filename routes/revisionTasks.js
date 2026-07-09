const express = require("express");
const router = express.Router();

const { RevisionTask, validate } = require("../models/revisionTask");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { WeakTopic } = require("../models/weakTopic");
const { Lesson } = require("../models/lesson");
const { Quiz } = require("../models/quiz");
const { LibraryResource } = require("../models/libraryResource");

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// GET ALL REVISION TASKS
router.get("/", async (req, res) => {
  const tasks = await RevisionTask.find()
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("quiz", "title")
    .populate("libraryResource", "title resourceType")
    .populate("weakTopicReport", "averageScore weakTopics status")
    .sort("-createdAt");

  res.send(tasks);
});

// GET TODAY'S TASKS FOR STUDENT
router.get("/student/:studentId/today", async (req, res) => {
  const { start, end } = getTodayRange();

  const tasks = await RevisionTask.find({
    student: req.params.studentId,
    taskDate: { $gte: start, $lte: end },
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("quiz", "title")
    .populate("libraryResource", "title resourceType")
    .populate("weakTopicReport", "averageScore weakTopics status")
    .sort("priority createdAt");

  res.send(tasks);
});

// GET ALL TASKS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const tasks = await RevisionTask.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("quiz", "title")
    .populate("libraryResource", "title resourceType")
    .populate("weakTopicReport", "averageScore weakTopics status")
    .sort("-taskDate");

  res.send(tasks);
});

// AUTO GENERATE TODAY'S REVISION TASKS FROM WEAK TOPICS
router.post("/generate-today/:studentId", async (req, res) => {
  const student = await User.findById(req.params.studentId);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const { start, end } = getTodayRange();

  const existingTasks = await RevisionTask.find({
    student: req.params.studentId,
    taskDate: { $gte: start, $lte: end },
  });

  if (existingTasks.length > 0) {
    return res.send({
      message: "Today's revision tasks already generated.",
      tasks: existingTasks,
    });
  }

  const weakReports = await WeakTopic.find({
    student: req.params.studentId,
  })
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt")
    .limit(3);

  const createdTasks = [];

  for (const report of weakReports) {
    if (!report.weakTopics || report.weakTopics.length === 0) continue;

    for (const weakTopic of report.weakTopics.slice(0, 2)) {
      const lesson = await Lesson.findOne({
        subject: report.subject._id,
        class: report.class._id,
        title: { $regex: weakTopic.topic, $options: "i" },
      });

      const quiz = await Quiz.findOne({
        subject: report.subject._id,
        class: report.class._id,
        title: { $regex: weakTopic.topic, $options: "i" },
      });

      const libraryResource = await LibraryResource.findOne({
        subject: report.subject._id,
        class: report.class._id,
        is_published: true,
        $or: [
          { title: { $regex: weakTopic.topic, $options: "i" } },
          { description: { $regex: weakTopic.topic, $options: "i" } },
          { tags: { $regex: weakTopic.topic, $options: "i" } },
        ],
      });

      const task = new RevisionTask({
        student: req.params.studentId,
        subject: report.subject._id,
        class: report.class._id,
        taskDate: new Date(),
        title: `Revise ${weakTopic.topic}`,
        description: weakTopic.recommendation,
        topic: weakTopic.topic,
        taskType: quiz ? "DO_QUIZ" : libraryResource ? "PAST_PAPER" : lesson ? "READ_NOTES" : "OTHER",
        lesson: lesson ? lesson._id : undefined,
        quiz: quiz ? quiz._id : undefined,
        libraryResource: libraryResource ? libraryResource._id : undefined,
        weakTopicReport: report._id,
        priority: weakTopic.averageScore < 50 ? "HIGH" : "NORMAL",
        status: "PENDING",
      });

      await task.save();
      createdTasks.push(task);
    }
  }

  res.send({
    message: "Today's revision tasks generated successfully.",
    tasks: createdTasks,
  });
});

// GET SINGLE TASK
router.get("/:id", async (req, res) => {
  const task = await RevisionTask.findById(req.params.id)
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .populate("lesson", "title")
    .populate("quiz", "title")
    .populate("libraryResource", "title resourceType")
    .populate("weakTopicReport", "averageScore weakTopics status");

  if (!task) return res.status(404).send("Revision task not found.");

  res.send(task);
});

// CREATE MANUAL REVISION TASK
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  const task = new RevisionTask({
    student: req.body.student,
    subject: req.body.subject,
    class: req.body.class,
    taskDate: req.body.taskDate || new Date(),
    title: req.body.title,
    description: req.body.description,
    topic: req.body.topic,
    taskType: req.body.taskType,
    lesson: req.body.lesson || undefined,
    quiz: req.body.quiz || undefined,
    libraryResource: req.body.libraryResource || undefined,
    weakTopicReport: req.body.weakTopicReport || undefined,
    priority: req.body.priority,
    status: req.body.status,
  });

  await task.save();

  res.send(task);
});

// UPDATE TASK
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const task = await RevisionTask.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      subject: req.body.subject,
      class: req.body.class,
      taskDate: req.body.taskDate,
      title: req.body.title,
      description: req.body.description,
      topic: req.body.topic,
      taskType: req.body.taskType,
      lesson: req.body.lesson || undefined,
      quiz: req.body.quiz || undefined,
      libraryResource: req.body.libraryResource || undefined,
      weakTopicReport: req.body.weakTopicReport || undefined,
      priority: req.body.priority,
      status: req.body.status,
      completedAt: req.body.status === "COMPLETED" ? new Date() : undefined,
    },
    { new: true }
  );

  if (!task) return res.status(404).send("Revision task not found.");

  res.send(task);
});

// MARK TASK COMPLETE
router.put("/:id/complete", async (req, res) => {
  const task = await RevisionTask.findByIdAndUpdate(
    req.params.id,
    {
      status: "COMPLETED",
      completedAt: new Date(),
    },
    { new: true }
  );

  if (!task) return res.status(404).send("Revision task not found.");

  res.send(task);
});

// DELETE TASK
router.delete("/:id", async (req, res) => {
  const task = await RevisionTask.findByIdAndDelete(req.params.id);

  if (!task) return res.status(404).send("Revision task not found.");

  res.send(task);
});

module.exports = router;