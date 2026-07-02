const mongoose = require("mongoose");
const Joi = require("joi");

const resultSchema = new mongoose.Schema(
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

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3"],
      required: true,
    },

    examType: {
      type: String,
      enum: ["TEST", "ASSIGNMENT", "MID_TERM", "END_OF_TERM", "MOCK"],
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },

    grade: {
      type: String,
      maxlength: 10,
    },

    teacherComment: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const Result =
  mongoose.models.Result || mongoose.model("Result", resultSchema);

function validateResult(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    term: Joi.string().valid("TERM_1", "TERM_2", "TERM_3").required(),
    examType: Joi.string()
      .valid("TEST", "ASSIGNMENT", "MID_TERM", "END_OF_TERM", "MOCK")
      .required(),
    score: Joi.number().min(0).required(),
    totalMarks: Joi.number().min(1).required(),
    grade: Joi.string().max(10).optional().allow(""),
    teacherComment: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  Result,
  validate: validateResult,
};