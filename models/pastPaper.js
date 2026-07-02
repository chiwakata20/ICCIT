const mongoose = require("mongoose");
const Joi = require("joi");

const pastPaperSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },

    exam_session: {
      type: String,
      enum: ["JUNE", "NOVEMBER", "MARCH", "OCTOBER", "OTHER"],
      required: true,
    },

    paper_number: {
      type: String,
      enum: ["PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PAPER_5", "PRACTICAL", "COURSEWORK"],
      required: true,
    },

    paper_type: {
      type: String,
      enum: ["QUESTION_PAPER", "MARK_SCHEME", "INSERT", "SOURCE_BOOKLET", "EXAMINER_REPORT"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },

    file_url: {
      type: String,
      required: true,
      trim: true,
    },

    duration_minutes: {
      type: Number,
      min: 10,
      max: 300,
    },

    total_marks: {
      type: Number,
      min: 1,
      max: 300,
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

pastPaperSchema.index({
  subject_id: 1,
  year: 1,
  exam_session: 1,
  paper_number: 1,
  paper_type: 1,
});

const PastPaper = mongoose.model("PastPaper", pastPaperSchema);

function validatePastPaper(paper) {
  const schema = Joi.object({
    subject_id: Joi.string().hex().length(24).required(),

    year: Joi.number().min(2000).max(2100).required(),

    exam_session: Joi.string()
      .valid("JUNE", "NOVEMBER", "MARCH", "OCTOBER", "OTHER")
      .required(),

    paper_number: Joi.string()
      .valid("PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PAPER_5", "PRACTICAL", "COURSEWORK")
      .required(),

    paper_type: Joi.string()
      .valid("QUESTION_PAPER", "MARK_SCHEME", "INSERT", "SOURCE_BOOKLET", "EXAMINER_REPORT")
      .required(),

    title: Joi.string().max(200).required(),

    file_url: Joi.string().uri().required(),

    duration_minutes: Joi.number().min(10).max(300).optional(),

    total_marks: Joi.number().min(1).max(300).optional(),

    approved: Joi.boolean().optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(paper);
}

module.exports = {
  PastPaper,
  validatePastPaper,
};