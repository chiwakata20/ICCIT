const mongoose = require("mongoose");
const Joi = require("joi");

const practiceAnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  studentAnswer: {
    type: String,
    required: true,
  },

  correctAnswer: String,

  modelAnswer: String,

  explanation: String,

  examinerComment: String,

  markingGrade: {
    type: String,
    enum: ["EXCELLENT", "GOOD", "FAIR", "WEAK", "POOR"],
  },

  commonMistakes: {
    type: [String],
    default: undefined,
  },

  howToImprove: {
    type: [String],
    default: undefined,
  },

  marksAwarded: {
    type: Number,
    default: 0,
  },

  totalMarks: {
    type: Number,
    default: 0,
  },

  isCorrect: {
    type: Boolean,
    default: false,
  },
});

const pastPaperPracticeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    pastPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PastPaper",
      required: true,
    },

    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SyllabusTopic",
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD", "MIXED"],
      default: "MIXED",
    },

    timeLimitMinutes: {
      type: Number,
      required: true,
      min: 5,
    },

    answers: [practiceAnswerSchema],

    score: {
      type: Number,
      default: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    overallGrade: {
      type: String,
    },

    examinerStyleComment: {
      type: String,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED", "MARKED"],
      default: "IN_PROGRESS",
    },

    submittedAt: Date,
  },
  { timestamps: true }
);

const PastPaperPractice =
  mongoose.models.PastPaperPractice ||
  mongoose.model("PastPaperPractice", pastPaperPracticeSchema);

function validateStartPractice(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    pastPaper: Joi.string().hex().length(24).required(),
    topic_id: Joi.string().hex().length(24).optional().allow(""),
    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD", "MIXED").optional(),
    timeLimitMinutes: Joi.number().min(5).required(),
  });

  return schema.validate(data);
}

function validateSubmitPractice(data) {
  const schema = Joi.object({
    answers: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().hex().length(24).required(),
          studentAnswer: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
  });

  return schema.validate(data);
}

module.exports = {
  PastPaperPractice,
  validateStartPractice,
  validateSubmitPractice,
};