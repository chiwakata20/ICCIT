const mongoose = require("mongoose");
const Joi = require("joi");

const lessonPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 150 },

    schemeOfWork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchemeOfWork",
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
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

    date: { type: Date, required: true },

    durationMinutes: {
      type: Number,
      default: 35,
    },

    topic: { type: String, required: true, maxlength: 200 },

    objectives: { type: String, required: true, maxlength: 1000 },

    introduction: { type: String, maxlength: 1000 },

    teacherActivities: { type: String, maxlength: 2000 },

    learnerActivities: { type: String, maxlength: 2000 },

    teachingMedia: { type: String, maxlength: 1000 },

    evaluation: { type: String, maxlength: 1000 },

    conclusion: { type: String, maxlength: 1000 },

    homework: { type: String, maxlength: 1000 },

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },

    adminComment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

const LessonPlan =
  mongoose.models.LessonPlan ||
  mongoose.model("LessonPlan", lessonPlanSchema);

function validateLessonPlan(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    schemeOfWork: Joi.string().hex().length(24).optional().allow(""),
    lesson: Joi.string().hex().length(24).optional().allow(""),
    teacher: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    date: Joi.date().required(),
    durationMinutes: Joi.number().min(1).optional(),
    topic: Joi.string().max(200).required(),
    objectives: Joi.string().max(1000).required(),
    introduction: Joi.string().max(1000).optional().allow(""),
    teacherActivities: Joi.string().max(2000).optional().allow(""),
    learnerActivities: Joi.string().max(2000).optional().allow(""),
    teachingMedia: Joi.string().max(1000).optional().allow(""),
    evaluation: Joi.string().max(1000).optional().allow(""),
    conclusion: Joi.string().max(1000).optional().allow(""),
    homework: Joi.string().max(1000).optional().allow(""),
    status: Joi.string()
      .valid("DRAFT", "SUBMITTED", "APPROVED", "REJECTED")
      .optional(),
    adminComment: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  LessonPlan,
  validate: validateLessonPlan,
};