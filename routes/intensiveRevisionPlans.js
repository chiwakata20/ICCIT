const express = require("express");
const router = express.Router();

const {
  IntensiveRevisionPlan,
  validate,
} = require("../models/intensiveRevisionPlan");

const { RevisionTask } = require("../models/revisionTask");
const { RevisionReminder } = require("../models/revisionReminder");
const { RevisionProgressReport } = require("../models/revisionProgressReport");
const { WeakTopic } = require("../models/weakTopic");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

// START INTENSIVE REVISION
router.post("/start", async (req, res) => {
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

  const existingPlan = await IntensiveRevisionPlan.findOne({
    student: req.body.student,
    subject: req.body.subject,
    status: "ACTIVE",
  });

  if (existingPlan) {
    return res.status(400).send("Active intensive revision plan already exists for this subject.");
  }

  const weakReports = await WeakTopic.find({
    student: req.body.student,
    subject: req.body.subject,
  }).sort("-createdAt");

  let weakTopics = [];

  weakReports.forEach((report) => {
    if (report.weakTopics && report.weakTopics.length > 0) {
      weakTopics.push(...report.weakTopics);
    }
  });

  if (weakTopics.length === 0) {
    weakTopics = [
      {
        topic: "General Revision",
        averageScore: 0,
        recommendation: "Revise all major topics and attempt practice questions.",
      },
    ];
  }

  const plan = new IntensiveRevisionPlan({
    student: req.body.student,
    subject: req.body.subject,
    class: req.body.class,
    examDate: req.body.examDate,
    availableStudyTimeMinutes: req.body.availableStudyTimeMinutes,
    weakTopics,
    status: "ACTIVE",
  });

  await plan.save();

  const today = new Date();
  const daysToExam = getDaysBetween(today, req.body.examDate);
  const createdTasks = [];
  const createdReminders = [];

  for (let i = 0; i < daysToExam; i++) {
    const topic = weakTopics[i % weakTopics.length];
    const taskDate = addDays(today, i);

    const task = new RevisionTask({
      student: req.body.student,
      subject: req.body.subject,
      class: req.body.class,
      taskDate,
      title: `Intensive Revision: ${topic.topic}`,
      description:
        topic.recommendation ||
        `Revise ${topic.topic} and attempt practice questions.`,
      topic: topic.topic,
      taskType: "OTHER",
      weakTopicReport: undefined,
      priority: topic.averageScore < 50 ? "HIGH" : "NORMAL",
      status: "PENDING",
    });

    await task.save();
    createdTasks.push(task);

    const reminder = new RevisionReminder({
      student: req.body.student,
      plan: plan._id,
      message: `Reminder: Today revise ${topic.topic} for ${subject.name}. Study time: ${req.body.availableStudyTimeMinutes} minutes.`,
      reminderDate: taskDate,
    });

    await reminder.save();
    createdReminders.push(reminder);

    if ((i + 1) % 7 === 0) {
      const weeklyTest = new RevisionTask({
        student: req.body.student,
        subject: req.body.subject,
        class: req.body.class,
        taskDate,
        title: `Weekly Test: ${subject.name}`,
        description: "Attempt a weekly test based on the topics revised this week.",
        topic: "Weekly Test",
        taskType: "DO_QUIZ",
        priority: "HIGH",
        status: "PENDING",
      });

      await weeklyTest.save();
      createdTasks.push(weeklyTest);
    }
  }

  const progressReport = new RevisionProgressReport({
    student: req.body.student,
    plan: plan._id,
    totalTasks: createdTasks.length,
    completedTasks: 0,
    pendingTasks: createdTasks.length,
    progressPercentage: 0,
    comment: "Intensive revision plan started.",
  });

  await progressReport.save();

  res.send({
    message: "Intensive revision plan started successfully.",
    plan,
    dailyTasks: createdTasks,
    reminders: createdReminders,
    progressReport,
  });
});

// GET STUDENT ACTIVE PLANS
router.get("/student/:studentId", async (req, res) => {
  const plans = await IntensiveRevisionPlan.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(plans);
});

// GET SINGLE PLAN
router.get("/:id", async (req, res) => {
  const plan = await IntensiveRevisionPlan.findById(req.params.id)
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!plan) return res.status(404).send("Intensive revision plan not found.");

  res.send(plan);
});

// GENERATE PROGRESS REPORT
router.post("/:id/progress", async (req, res) => {
  const plan = await IntensiveRevisionPlan.findById(req.params.id);
  if (!plan) return res.status(404).send("Intensive revision plan not found.");

  const tasks = await RevisionTask.find({
    student: plan.student,
    subject: plan.subject,
    class: plan.class,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = totalTasks - completedTasks;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  plan.progressPercentage = progressPercentage;
  await plan.save();

  const report = new RevisionProgressReport({
    student: plan.student,
    plan: plan._id,
    totalTasks,
    completedTasks,
    pendingTasks,
    progressPercentage,
    comment:
      progressPercentage >= 80
        ? "Excellent revision progress."
        : progressPercentage >= 50
        ? "Good progress. Keep revising daily."
        : "Revision progress is low. More effort is needed.",
  });

  await report.save();

  res.send(report);
});

// CANCEL PLAN
router.put("/:id/cancel", async (req, res) => {
  const plan = await IntensiveRevisionPlan.findByIdAndUpdate(
    req.params.id,
    { status: "CANCELLED" },
    { new: true }
  );

  if (!plan) return res.status(404).send("Intensive revision plan not found.");

  res.send(plan);
});

module.exports = router;