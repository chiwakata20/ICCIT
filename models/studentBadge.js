const mongoose = require("mongoose");
const Joi = require("joi");

const studentBadgeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
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

    awardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    awardedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

studentBadgeSchema.index(
  { student: 1, badge: 1, subject: 1 },
  { unique: false }
);

const StudentBadge =
  mongoose.models.StudentBadge ||
  mongoose.model("StudentBadge", studentBadgeSchema);

function validateStudentBadge(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    badge: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).optional().allow(""),
    subject: Joi.string().hex().length(24).optional().allow(""),
    awardedBy: Joi.string().hex().length(24).required(),
    reason: Joi.string().max(1000).required(),
    awardedAt: Joi.date().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  StudentBadge,
  validate: validateStudentBadge,
};