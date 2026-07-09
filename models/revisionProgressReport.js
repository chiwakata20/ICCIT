const mongoose = require("mongoose");
const Joi = require("joi");

const revisionProgressReportSchema = new mongoose.Schema(
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

    totalTasks: {
      type: Number,
      default: 0,
    },

    completedTasks: {
      type: Number,
      default: 0,
    },

    pendingTasks: {
      type: Number,
      default: 0,
    },

    progressPercentage: {
      type: Number,
      default: 0,
    },

    comment: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const RevisionProgressReport =
  mongoose.models.RevisionProgressReport ||
  mongoose.model("RevisionProgressReport", revisionProgressReportSchema);

function validateRevisionProgressReport(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    plan: Joi.string().hex().length(24).required(),
  });

  return schema.validate(data);
}

module.exports = {
  RevisionProgressReport,
  validate: validateRevisionProgressReport,
};