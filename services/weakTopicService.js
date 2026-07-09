const { WeakTopic } = require("../models/weakTopic");
const { Question } = require("../models/question");

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

async function generateWeakTopics({
  student,
  subject,
  classId,
  sourceType,
  sourceId,
  answers,
}) {
  const topicGroups = {};
  let totalScore = 0;
  let totalMarks = 0;

  for (const item of answers) {
    const question = await Question.findById(item.question).populate(
      "topic_id",
      "title name"
    );

    if (!question) continue;

    const topic =
      question.topic_id?.title || question.topic_id?.name || "General";

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

  return await WeakTopic.findOneAndUpdate(
    {
      student,
      subject,
      sourceType,
      sourceId,
    },
    {
      student,
      subject,
      class: classId,
      sourceType,
      sourceId,
      averageScore,
      weakTopics,
      status: getStatus(averageScore),
    },
    { new: true, upsert: true }
  );
}

module.exports = {
  generateWeakTopics,
};