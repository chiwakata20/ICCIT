const express = require("express");
const router = express.Router();

const { generateWeakTopics } = require("../services/weakTopicService");
const {
  MockExamSubmission,
  validate,
} = require("../models/mockExamSubmission");

const { MockExam } = require("../models/mockExam");
const { Question } = require("../models/question");
const { User } = require("../models/user");
const { Result } = require("../models/result");
const { WeakTopic } = require("../models/weakTopic");


function calculateGrade(percentage) {
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "E";
}

// GET ALL SUBMISSIONS
router.get("/", async (req, res) => {
  const submissions = await MockExamSubmission.find()
    .populate("mockExam", "title syllabus totalMarks durationMinutes")
    .populate("student", "name email role")
    .populate("answers.question")
    .sort("-createdAt");

  res.send(submissions);
});

// GET SUBMISSIONS BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const submissions = await MockExamSubmission.find({
    student: req.params.studentId,
  })
    .populate("mockExam", "title syllabus totalMarks durationMinutes")
    .populate("student", "name email role")
    .populate("answers.question")
    .sort("-createdAt");

  res.send(submissions);
});

// GET SUBMISSIONS BY MOCK EXAM
router.get("/exam/:mockExamId", async (req, res) => {
  const submissions = await MockExamSubmission.find({
    mockExam: req.params.mockExamId,
  })
    .populate("mockExam", "title syllabus totalMarks durationMinutes")
    .populate("student", "name email role")
    .populate("answers.question")
    .sort("-createdAt");

  res.send(submissions);
});

// GET SINGLE SUBMISSION
router.get("/:id", async (req, res) => {
  const submission = await MockExamSubmission.findById(req.params.id)
    .populate("mockExam", "title syllabus totalMarks durationMinutes")
    .populate("student", "name email role")
    .populate("answers.question");

  if (!submission) return res.status(404).send("Mock exam submission not found.");

  res.send(submission);
});

// SUBMIT MOCK EXAM
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exam = await MockExam.findById(req.body.mockExam).populate("questions");
  if (!exam) return res.status(400).send("Invalid mock exam.");

  if (exam.status !== "PUBLISHED") {
    return res.status(400).send("This mock exam is not open for submission.");
  }

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const existing = await MockExamSubmission.findOne({
    mockExam: req.body.mockExam,
    student: req.body.student,
  });

  if (existing) {
    return res.status(400).send("Student has already submitted this mock exam.");
  }

  let score = 0;
  let totalMarks = exam.totalMarks || 0;
  const markedAnswers = [];

  for (const item of req.body.answers) {
    const question = await Question.findById(item.question);
    if (!question) return res.status(400).send("Invalid question.");

    const questionMarks = question.marks || question.points || 1;

    const correctAnswer =
      question.correctAnswer ||
      question.answer ||
      question.correct_answer;

    let isCorrect = false;
    let marksAwarded = 0;

    if (correctAnswer) {
      isCorrect =
        String(item.answer).trim().toLowerCase() ===
        String(correctAnswer).trim().toLowerCase();

      marksAwarded = isCorrect ? questionMarks : 0;
    }

    score += marksAwarded;

    markedAnswers.push({
      question: item.question,
      answer: item.answer,
      isCorrect,
      marksAwarded,
    });
  }

  if (!totalMarks) {
    totalMarks = markedAnswers.reduce((sum, answer) => {
      return sum + (answer.marksAwarded || 0);
    }, 0);
  }

  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const submission = new MockExamSubmission({
    mockExam: req.body.mockExam,
    student: req.body.student,
    answers: markedAnswers,
    score,
    totalMarks,
    percentage,
    grade: calculateGrade(percentage),
    status: "MARKED",
    teacherFeedback: req.body.teacherFeedback,
  });

  await submission.save();

  

  const result = new Result({
    student: req.body.student,
    subject: exam.subject,
    class: exam.class,
    term: "TERM_1",
    examType: "MOCK",
    score,
    totalMarks,
    grade: calculateGrade(percentage),
    teacherComment: "Mock exam result generated automatically.",
  });

   await result.save();

  const weakTopicReport = await generateWeakTopics({
  student: req.body.student,
  subject: exam.subject,
  classId: exam.class,
  sourceType: "MOCK_EXAM",
  sourceId: submission._id,
  answers: markedAnswers,
});

 

  res.send({
    submission,
    result,
     weakTopicReport,
  });
});

// MANUAL MARK / UPDATE SUBMISSION
router.put("/:id/mark", async (req, res) => {
  const submission = await MockExamSubmission.findById(req.params.id);
  if (!submission) return res.status(404).send("Mock exam submission not found.");

  const score = req.body.score;
  const totalMarks = req.body.totalMarks || submission.totalMarks;
  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  submission.score = score;
  submission.totalMarks = totalMarks;
  submission.percentage = percentage;
  submission.grade = calculateGrade(percentage);
  submission.status = "MARKED";
  submission.teacherFeedback = req.body.teacherFeedback;

  await submission.save();

  res.send(submission);
});

// DELETE SUBMISSION
router.delete("/:id", async (req, res) => {
  const submission = await MockExamSubmission.findByIdAndDelete(req.params.id);

  if (!submission) return res.status(404).send("Mock exam submission not found.");

  res.send(submission);
});

module.exports = router;