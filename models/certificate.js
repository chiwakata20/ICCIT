const mongoose = require("mongoose");
const Joi = require("joi");

const certificateSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    certificateType: {
      type: String,
      enum: [
        "ACADEMIC_EXCELLENCE",
        "BEST_ATTENDANCE",
        "HOMEWORK_COMPLETION",
        "QUIZ_MASTER",
        "PARTICIPATION",
        "COMPLETION",
        "OTHER",
      ],
      required: true,
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    certificateFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachment",
    },

    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "REVOKED"],
      default: "ISSUED",
    },
  },
  { timestamps: true }
);

const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);

function validateCertificate(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).optional().allow(""),
    subject: Joi.string().hex().length(24).optional().allow(""),
    title: Joi.string().min(2).max(150).required(),
    description: Joi.string().max(1000).optional().allow(""),
    certificateType: Joi.string()
      .valid(
        "ACADEMIC_EXCELLENCE",
        "BEST_ATTENDANCE",
        "HOMEWORK_COMPLETION",
        "QUIZ_MASTER",
        "PARTICIPATION",
        "COMPLETION",
        "OTHER"
      )
      .required(),
    issuedBy: Joi.string().hex().length(24).required(),
    issueDate: Joi.date().optional(),
    certificateFile: Joi.string().hex().length(24).optional().allow(""),
    status: Joi.string().valid("DRAFT", "ISSUED", "REVOKED").optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Certificate,
  validate: validateCertificate,
};