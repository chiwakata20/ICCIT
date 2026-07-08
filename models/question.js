const mongoose = require("mongoose");
const Joi = require("joi");

const questionSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SyllabusTopic",
      required: true,
    },

    question_text: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 3000,
      trim: true,
    },

    question_type: {
      type: String,
      enum: ["MULTIPLE_CHOICE", "SHORT_ANSWER", "STRUCTURED", "ESSAY", "CALCULATION", "PRACTICAL"],
      required: true,
    },

    options: [
      {
        label: {
          type: String,
          enum: ["A", "B", "C", "D", "E"],
        },
        text: {
          type: String,
          maxlength: 1000,
        },
      },
    ],

    correct_answer: {
      type: String,
      maxlength: 2000,
      trim: true,
    },

    explanation: {
      type: String,
      maxlength: 3000,
      trim: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD"],
      default: "EASY",
    },

    paper: {
      type: String,
      enum: ["PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PRACTICAL", "ALL"],
      default: "ALL",
    },

    approved: {
      type: Boolean,
      default: false,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ subject_id: 1, topic_id: 1, difficulty: 1 });

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

function validateQuestion(question) {
  const schema = Joi.object({
    subject_id: Joi.string().hex().length(24).required(),

    topic_id: Joi.string().hex().length(24).required(),

    question_text: Joi.string().min(5).max(3000).required(),

    question_type: Joi.string()
      .valid("MULTIPLE_CHOICE", "SHORT_ANSWER", "STRUCTURED", "ESSAY", "CALCULATION", "PRACTICAL")
      .required(),

    options: Joi.array()
      .items(
        Joi.object({
          label: Joi.string().valid("A", "B", "C", "D", "E").required(),
          text: Joi.string().max(1000).required(),
        })
      )
      .optional(),

    correct_answer: Joi.string().max(2000).optional().allow(""),

    explanation: Joi.string().max(3000).optional().allow(""),

    marks: Joi.number().min(1).max(50).required(),

    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD").optional(),

    paper: Joi.string()
      .valid("PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PRACTICAL", "ALL")
      .optional(),

    approved: Joi.boolean().optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(question);
}

module.exports = {
  Question,
  validateQuestion,
};