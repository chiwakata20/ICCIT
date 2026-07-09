const mongoose = require("mongoose");
const Joi = require("joi");

const QuestionSchema = new mongoose.Schema(
  {
    pastPaper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PastPaper",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SyllabusTopic",
      required: true,
    },

    questionNumber: {
      type: String,
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    questionType: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "STRUCTURED"],
      required: true,
    },

    options: {
      type: [String],
      default: undefined,
    },

    correctAnswer: {
      type: String,
      maxlength: 5000,
    },

    modelAnswer: {
      type: String,
      maxlength: 10000,
    },

    explanation: {
      type: String,
      maxlength: 10000,
    },

    examinerComment: {
      type: String,
      maxlength: 3000,
    },

    commonMistakes: {
      type: [String],
      default: undefined,
    },

    improvementTips: {
      type: [String],
      default: undefined,
    },

    marks: {
      type: Number,
      required: true,
      min: 1,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      required: true,
    },
  },
  { timestamps: true }
);

const Question =
  mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);

function validateQuestion(data) {
  const schema = Joi.object({
    pastPaper: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    topic_id: Joi.string().hex().length(24).required(),
    questionNumber: Joi.string().required(),
    questionText: Joi.string().max(5000).required(),
    questionType: Joi.string()
      .valid("MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "STRUCTURED")
      .required(),
    options: Joi.array().items(Joi.string()).optional(),
    correctAnswer: Joi.string().max(5000).optional().allow(""),
    modelAnswer: Joi.string().max(10000).optional().allow(""),
    explanation: Joi.string().max(10000).optional().allow(""),
    examinerComment: Joi.string().max(3000).optional().allow(""),
    commonMistakes: Joi.array().items(Joi.string()).optional(),
    improvementTips: Joi.array().items(Joi.string()).optional(),
    marks: Joi.number().min(1).required(),
    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").required(),
  });

  return schema.validate(data);
}

module.exports = {
  Question,
  validate: validateQuestion,
};