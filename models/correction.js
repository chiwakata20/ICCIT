const mongoose = require("mongoose");
const Joi = require("joi");

const correctionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
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

    correctionType: {
      type: String,
      enum: ["HOMEWORK", "ASSIGNMENT", "QUIZ", "TEST", "MOCK_EXAM", "OTHER"],
      required: true,
    },

    relatedModel: {
      type: String,
      enum: ["Homework", "Assignment", "Quiz", "MockExam", "Result", "Other"],
      default: "Other",
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },

    mistakeDescription: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    correctedAnswer: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],

    status: {
      type: String,
      enum: ["SUBMITTED", "REVIEWED", "APPROVED", "REJECTED"],
      default: "SUBMITTED",
    },

    teacherFeedback: {
      type: String,
      maxlength: 2000,
    },

    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Correction =
  mongoose.models.Correction ||
  mongoose.model("Correction", correctionSchema);

function validateCorrection(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),

    correctionType: Joi.string()
      .valid("HOMEWORK", "ASSIGNMENT", "QUIZ", "TEST", "MOCK_EXAM", "OTHER")
      .required(),

    relatedModel: Joi.string()
      .valid("Homework", "Assignment", "Quiz", "MockExam", "Result", "Other")
      .optional(),

    relatedId: Joi.string().hex().length(24).optional().allow(""),

    title: Joi.string().min(2).max(200).required(),
    mistakeDescription: Joi.string().max(3000).required(),
    correctedAnswer: Joi.string().max(5000).required(),

    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),

    status: Joi.string()
      .valid("SUBMITTED", "REVIEWED", "APPROVED", "REJECTED")
      .optional(),

    teacherFeedback: Joi.string().max(2000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  Correction,
  validate: validateCorrection,
};