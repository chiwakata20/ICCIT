const express = require("express");
const router = express.Router();

const {
  PastPaperPractice,
  validateStartPractice,
  validateSubmitPractice,
} = require("../models/pastPaperPractice");

const { User } = require("../models/user");
const { Subject } = require("../models/subject");
const { PastPaper } = require("../models/pastPaper");
const { Question } = require("../models/question");

function getGrade(percentage) {
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "E";
}

function getMarkingGrade(percentage) {
  if (percentage >= 80) return "EXCELLENT";
  if (percentage >= 70) return "GOOD";
  if (percentage >= 60) return "FAIR";
  if (percentage >= 40) return "WEAK";
  return "POOR";
}

function getExaminerComment(percentage) {
  if (percentage >= 80) return "Excellent response. The answer is accurate, well-structured and shows strong exam technique.";
  if (percentage >= 60) return "Good attempt. The answer shows understanding but needs more detail and stronger exam wording.";
  if (percentage >= 40) return "Fair attempt. Some correct points are present, but the answer lacks depth or accuracy.";
  return "Weak response. Revise the topic, study the model answer and practise similar questions.";
}

// START PRACTICE
router.post("/start", async (req, res) => {
  const { error } = validateStartPractice(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const subject = await Subject.findById(req.body.subject);
  if (!subject) return res.status(400).send("Invalid subject.");

  const pastPaper = await PastPaper.findById(req.body.pastPaper);
  if (!pastPaper) return res.status(400).send("Invalid past paper.");

  const filter = {
    pastPaper: req.body.pastPaper,
    subject: req.body.subject,
  };

  if (req.body.topic_id) filter.topic_id = req.body.topic_id;
  if (req.body.difficulty && req.body.difficulty !== "MIXED") {
    filter.difficulty = req.body.difficulty;
  }

  const questions = await Question.find(filter)
    .populate("topic_id", "title name")
    .sort("questionNumber");

  if (questions.length === 0) {
    return res.status(400).send("No questions found for selected filters.");
  }

  const practice = new PastPaperPractice({
    student: req.body.student,
    subject: req.body.subject,
    pastPaper: req.body.pastPaper,
    topic_id: req.body.topic_id || undefined,
    difficulty: req.body.difficulty,
    timeLimitMinutes: req.body.timeLimitMinutes,
    status: "IN_PROGRESS",
  });

  await practice.save();

  res.send({
    practice,
    questions,
  });
});

// SUBMIT PRACTICE
router.post("/:id/submit", async (req, res) => {
  const { error } = validateSubmitPractice(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const practice = await PastPaperPractice.findById(req.params.id);
  if (!practice) return res.status(404).send("Practice session not found.");

  let score = 0;
  let totalMarks = 0;
  const markedAnswers = [];

  for (const item of req.body.answers) {
    const question = await Question.findById(item.question)
      .populate("topic_id", "title name");

    if (!question) return res.status(400).send("Invalid question.");

    const studentAnswer = String(item.studentAnswer).trim();
    const correctAnswer = question.correctAnswer || "";
    const questionMarks = question.marks || 1;

    let marksAwarded = 0;
    let isCorrect = false;

    if (
      question.questionType === "MULTIPLE_CHOICE" ||
      question.questionType === "TRUE_FALSE" ||
      question.questionType === "SHORT_ANSWER"
    ) {
      isCorrect =
        studentAnswer.toLowerCase() ===
        String(correctAnswer).trim().toLowerCase();

      marksAwarded = isCorrect ? questionMarks : 0;
    } else {
      const words = studentAnswer.split(/\s+/).filter(Boolean).length;

      if (words >= 80) marksAwarded = Math.round(questionMarks * 0.7);
      else if (words >= 40) marksAwarded = Math.round(questionMarks * 0.5);
      else if (words >= 15) marksAwarded = Math.round(questionMarks * 0.3);
      else marksAwarded = 0;

      isCorrect = marksAwarded >= questionMarks * 0.6;
    }

    const percentage =
      questionMarks > 0 ? Math.round((marksAwarded / questionMarks) * 100) : 0;

    score += marksAwarded;
    totalMarks += questionMarks;

    markedAnswers.push({
      question: question._id,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      modelAnswer: question.modelAnswer,
      explanation: question.explanation,
      examinerComment:
        question.examinerComment || getExaminerComment(percentage),
      markingGrade: getMarkingGrade(percentage),
      commonMistakes: question.commonMistakes,
      howToImprove: question.improvementTips,
      marksAwarded,
      totalMarks: questionMarks,
      isCorrect,
    });
  }

  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  practice.answers = markedAnswers;
  practice.score = score;
  practice.totalMarks = totalMarks;
  practice.percentage = percentage;
  practice.overallGrade = getGrade(percentage);
  practice.examinerStyleComment = getExaminerComment(percentage);
  practice.status = "MARKED";
  practice.submittedAt = new Date();

  await practice.save();

  res.send(practice);
});

// GET STUDENT PRACTICES
router.get("/student/:studentId", async (req, res) => {
  const practices = await PastPaperPractice.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("pastPaper", "title year paperCode syllabus")
    .populate("topic_id", "title name")
    .populate("answers.question")
    .sort("-createdAt");

  res.send(practices);
});

// GET SINGLE PRACTICE
router.get("/:id", async (req, res) => {
  const practice = await PastPaperPractice.findById(req.params.id)
    .populate("student", "name email role")
    .populate("subject", "name code level category")
    .populate("pastPaper", "title year paperCode syllabus")
    .populate("topic_id", "title name")
    .populate("answers.question");

  if (!practice) return res.status(404).send("Practice session not found.");

  res.send(practice);
});

module.exports = router;