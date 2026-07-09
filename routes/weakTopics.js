const express = require("express");
const router = express.Router();

const { WeakTopic, validate } = require("../models/weakTopic");
const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { Class } = require("../models/class");
const { Question } = require("../models/question");

const { MockExamSubmission } = require("../models/mockExamSubmission");

let QuizSubmission;
try {
  QuizSubmission = require("../models/quizSubmission").QuizSubmission;
} catch (err) {
  QuizSubmission = null;
}

function getStatus(averageScore) {
  if (averageScore >= 70) return "GOOD";
  if (averageScore >= 50) return "FAIR";
  return "WEAK";
}

function getRecommendation(topic, averageScore) {
  if (averageScore < 50) {
    return `Revise ${topic} urgently. Watch lesson videos, read notes, and attempt more practice questions.`;
  }

  return `Continue practicing ${topic} to improve confidence.`;
}

// GENERATE WEAK TOPIC REPORT
router.post("/generate", async (req, res) => {
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

  let submission = null;

  if (req.body.sourceType === "MOCK_EXAM") {
    submission = await MockExamSubmission.findById(req.body.sourceId);
  }

  if (req.body.sourceType === "QUIZ") {
    if (!QuizSubmission) {
      return res.status(400).send("QuizSubmission model is not available.");
    }

    submission = await QuizSubmission.findById(req.body.sourceId);
  }

  if (!submission) {
    return res.status(400).send("Invalid submission source.");
  }

  const topicGroups = {};
  let totalScore = 0;
  let totalMarks = 0;

  for (const item of submission.answers) {
    const question = await Question.findById(item.question)
      .populate("topic_id", "title name");

    if (!question) continue;

    const topic =
      question.topic_id?.title ||
      question.topic_id?.name ||
      "General";

    const questionMarks = question.marks || question.points || 1;
    const marksAwarded = item.marksAwarded || 0;

    if (!topicGroups[topic]) {
      topicGroups[topic] = {
        topic,
        totalQuestions: 0,
        correctAnswers: 0,
        score: 0,
        totalMarks: 0,
      };
    }

    topicGroups[topic].totalQuestions += 1;
    topicGroups[topic].score += marksAwarded;
    topicGroups[topic].totalMarks += questionMarks;

    if (item.isCorrect) {
      topicGroups[topic].correctAnswers += 1;
    }

    totalScore += marksAwarded;
    totalMarks += questionMarks;
  }

  const weakTopics = [];

  for (const topicName in topicGroups) {
    const topicData = topicGroups[topicName];

    const topicAverage =
      topicData.totalMarks > 0
        ? Math.round((topicData.score / topicData.totalMarks) * 100)
        : 0;

    if (topicAverage < 60) {
      weakTopics.push({
        topic: topicData.topic,
        averageScore: topicAverage,
        totalQuestions: topicData.totalQuestions,
        correctAnswers: topicData.correctAnswers,
        recommendation: getRecommendation(topicData.topic, topicAverage),
      });
    }
  }

  const averageScore =
    totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

  const weakTopicReport = await WeakTopic.findOneAndUpdate(
    {
      student: req.body.student,
      subject: req.body.subject,
      sourceType: req.body.sourceType,
      sourceId: req.body.sourceId,
    },
    {
      student: req.body.student,
      subject: req.body.subject,
      class: req.body.class,
      sourceType: req.body.sourceType,
      sourceId: req.body.sourceId,
      averageScore,
      weakTopics,
      status: getStatus(averageScore),
    },
    { new: true, upsert: true }
  );

  res.send(weakTopicReport);
});

// GET ALL WEAK TOPIC REPORTS
router.get("/", async (req, res) => {
  const reports = await WeakTopic.find()
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(reports);
});

// GET REPORTS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const reports = await WeakTopic.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(reports);
});

// GET REPORTS BY SUBJECT
router.get("/subject/:subjectId", async (req, res) => {
  const reports = await WeakTopic.find({
    subject: req.params.subjectId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus")
    .sort("-createdAt");

  res.send(reports);
});

// GET SINGLE REPORT
router.get("/:id", async (req, res) => {
  const report = await WeakTopic.findById(req.params.id)
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("class", "name syllabus");

  if (!report) return res.status(404).send("Weak topic report not found.");

  res.send(report);
});

// DELETE REPORT
router.delete("/:id", async (req, res) => {
  const report = await WeakTopic.findByIdAndDelete(req.params.id);

  if (!report) return res.status(404).send("Weak topic report not found.");

  res.send(report);
});

module.exports = router;