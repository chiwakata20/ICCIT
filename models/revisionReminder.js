const mongoose = require("mongoose");
const Joi = require("joi");

const revisionReminderSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IntensiveRevisionPlan",
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    reminderDate: {
      type: Date,
      required: true,
    },

    is_sent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const RevisionReminder =
  mongoose.models.RevisionReminder ||
  mongoose.model("RevisionReminder", revisionReminderSchema);

function validateRevisionReminder(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    plan: Joi.string().hex().length(24).required(),
    message: Joi.string().max(1000).required(),
    reminderDate: Joi.date().required(),
    is_sent: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  RevisionReminder,
  validate: validateRevisionReminder,
};