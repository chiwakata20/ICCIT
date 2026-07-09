const mongoose = require("mongoose");
const Joi = require("joi");

const revisionTaskSchema = new mongoose.Schema(
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

    taskDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    topic: {
      type: String,
      maxlength: 200,
    },

    taskType: {
      type: String,
      enum: ["READ_NOTES", "WATCH_VIDEO", "DO_QUIZ", "PAST_PAPER", "CORRECTION", "OTHER"],
      required: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
    },

    libraryResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryResource",
    },

    weakTopicReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeakTopic",
    },

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH"],
      default: "NORMAL",
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"],
      default: "PENDING",
    },

    estimatedMinutes: {
      type: Number,
      default: 0,
    },
    actualMinutesSpent: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const RevisionTask =
  mongoose.models.RevisionTask ||
  mongoose.model("RevisionTask", revisionTaskSchema);

function validateRevisionTask(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    taskDate: Joi.date().optional(),
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(2000).optional().allow(""),
    topic: Joi.string().max(200).optional().allow(""),
    taskType: Joi.string()
      .valid("READ_NOTES", "WATCH_VIDEO", "DO_QUIZ", "PAST_PAPER", "CORRECTION", "OTHER")
      .required(),
    lesson: Joi.string().hex().length(24).optional().allow(""),
    quiz: Joi.string().hex().length(24).optional().allow(""),
    libraryResource: Joi.string().hex().length(24).optional().allow(""),
    weakTopicReport: Joi.string().hex().length(24).optional().allow(""),
    priority: Joi.string().valid("LOW", "NORMAL", "HIGH").optional(),
    status: Joi.string().valid("PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED").optional(),
    estimatedMinutes: Joi.number().min(0).optional(),
    actualMinutesSpent: Joi.number().min(0).optional(),
  });

  return schema.validate(data);
}

module.exports = {
  RevisionTask,
  validate: validateRevisionTask,
};