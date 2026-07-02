const mongoose = require("mongoose");
const Joi = require("joi");

const studentProgressSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_REVISION"],
      default: "NOT_STARTED",
    },

    completion_percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    quiz_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    last_studied_at: {
      type: Date,
    },

    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
  },
  { timestamps: true }
);

studentProgressSchema.index(
  { student_id: 1, subject_id: 1, topic_id: 1 },
  { unique: true }
);

const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);

function validateStudentProgress(progress) {
  const schema = Joi.object({
    student_id: Joi.string().hex().length(24).required(),

    subject_id: Joi.string().hex().length(24).required(),

    topic_id: Joi.string().hex().length(24).required(),

    status: Joi.string()
      .valid("NOT_STARTED", "IN_PROGRESS", "COMPLETED", "NEEDS_REVISION")
      .optional(),

    completion_percentage: Joi.number().min(0).max(100).optional(),

    quiz_score: Joi.number().min(0).max(100).optional(),

    last_studied_at: Joi.date().optional(),

    notes: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(progress);
}

module.exports = {
  StudentProgress,
  validateStudentProgress,
};