const mongoose = require("mongoose");
const Joi = require("joi");

const intensiveRevisionPlanSchema = new mongoose.Schema(
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

    examDate: {
      type: Date,
      required: true,
    },

    availableStudyTimeMinutes: {
      type: Number,
      required: true,
      min: 15,
    },

    weakTopics: [
      {
        topic: String,
        averageScore: Number,
        recommendation: String,
      },
    ],

    startDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },

    progressPercentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const IntensiveRevisionPlan =
  mongoose.models.IntensiveRevisionPlan ||
  mongoose.model("IntensiveRevisionPlan", intensiveRevisionPlanSchema);

function validateIntensiveRevisionPlan(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    examDate: Joi.date().required(),
    availableStudyTimeMinutes: Joi.number().min(15).required(),
  });

  return schema.validate(data);
}

module.exports = {
  IntensiveRevisionPlan,
  validate: validateIntensiveRevisionPlan,
};