const mongoose = require("mongoose");
const Joi = require("joi");

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  answer: {
    type: String,
    required: true,
  },

  isCorrect: {
    type: Boolean,
    default: false,
  },

  marksAwarded: {
    type: Number,
    default: 0,
  },
});

const mockExamSubmissionSchema = new mongoose.Schema(
  {
    mockExam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MockExam",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: [answerSchema],

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

    grade: {
      type: String,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "MARKED"],
      default: "SUBMITTED",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    teacherFeedback: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

mockExamSubmissionSchema.index(
  { mockExam: 1, student: 1 },
  { unique: true }
);

const MockExamSubmission =
  mongoose.models.MockExamSubmission ||
  mongoose.model("MockExamSubmission", mockExamSubmissionSchema);

function validateMockExamSubmission(data) {
  const schema = Joi.object({
    mockExam: Joi.string().hex().length(24).required(),
    student: Joi.string().hex().length(24).required(),
    answers: Joi.array()
      .items(
        Joi.object({
          question: Joi.string().hex().length(24).required(),
          answer: Joi.string().required(),
        })
      )
      .min(1)
      .required(),
    teacherFeedback: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  MockExamSubmission,
  validate: validateMockExamSubmission,
};