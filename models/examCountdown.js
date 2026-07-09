const mongoose = require("mongoose");
const Joi = require("joi");

const examCountdownSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
    },

    examType: {
      type: String,
      enum: ["CLASS_TEST", "MOCK_EXAM", "MID_TERM", "END_OF_TERM", "FINAL_EXAM"],
      required: true,
    },

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

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      default: 120,
    },

    venue: {
      type: String,
      maxlength: 100,
    },

    instructions: {
      type: String,
      maxlength: 2000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

const ExamCountdown =
  mongoose.models.ExamCountdown ||
  mongoose.model("ExamCountdown", examCountdownSchema);

function validateExamCountdown(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    examType: Joi.string()
      .valid("CLASS_TEST", "MOCK_EXAM", "MID_TERM", "END_OF_TERM", "FINAL_EXAM")
      .required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    examDate: Joi.date().required(),
    startTime: Joi.string().optional().allow(""),
    durationMinutes: Joi.number().min(1).optional(),
    venue: Joi.string().max(100).optional().allow(""),
    instructions: Joi.string().max(2000).optional().allow(""),
    createdBy: Joi.string().hex().length(24).required(),
    status: Joi.string()
      .valid("DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED")
      .optional(),
  });

  return schema.validate(data);
}

module.exports = {
  ExamCountdown,
  validate: validateExamCountdown,
};