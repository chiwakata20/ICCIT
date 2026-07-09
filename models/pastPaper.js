const mongoose = require("mongoose");
const Joi = require("joi");

const pastPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 200 },

    syllabus: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE"],
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    paperCode: {
      type: String,
      required: true,
      maxlength: 50,
    },

    year: {
      type: Number,
      required: true,
    },

    session: {
      type: String,
      enum: ["JUNE", "NOVEMBER", "MARCH", "SPECIMEN", "OTHER"],
      default: "OTHER",
    },

    difficulty: {
      type: String,
      enum: ["EASY", "MEDIUM", "HARD", "MIXED"],
      default: "MIXED",
    },

    paperFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachment",
    },

    markingSchemeFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachment",
    },

    is_published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const PastPaper =
  mongoose.models.PastPaper ||
  mongoose.model("PastPaper", pastPaperSchema);

function validatePastPaper(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),
    subject: Joi.string().hex().length(24).required(),
    paperCode: Joi.string().max(50).required(),
    year: Joi.number().required(),
    session: Joi.string()
      .valid("JUNE", "NOVEMBER", "MARCH", "SPECIMEN", "OTHER")
      .optional(),
    difficulty: Joi.string().valid("EASY", "MEDIUM", "HARD", "MIXED").optional(),
    paperFile: Joi.string().hex().length(24).optional().allow(""),
    markingSchemeFile: Joi.string().hex().length(24).optional().allow(""),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  PastPaper,
  validate: validatePastPaper,
};