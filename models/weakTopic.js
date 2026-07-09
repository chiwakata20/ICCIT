const mongoose = require("mongoose");
const Joi = require("joi");

const weakTopicItemSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },

  averageScore: {
    type: Number,
    default: 0,
  },

  totalQuestions: {
    type: Number,
    default: 0,
  },

  correctAnswers: {
    type: Number,
    default: 0,
  },

  recommendation: {
    type: String,
  },
});

const weakTopicSchema = new mongoose.Schema(
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

    sourceType: {
      type: String,
      enum: ["QUIZ", "MOCK_EXAM"],
      required: true,
    },

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    averageScore: {
      type: Number,
      default: 0,
    },

    weakTopics: [weakTopicItemSchema],

    status: {
      type: String,
      enum: ["WEAK", "FAIR", "GOOD"],
      default: "WEAK",
    },
  },
  { timestamps: true }
);

weakTopicSchema.index(
  { student: 1, subject: 1, sourceType: 1, sourceId: 1 },
  { unique: true }
);

const WeakTopic =
  mongoose.models.WeakTopic ||
  mongoose.model("WeakTopic", weakTopicSchema);

function validateWeakTopic(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    sourceType: Joi.string().valid("QUIZ", "MOCK_EXAM").required(),
    sourceId: Joi.string().hex().length(24).required(),
  });

  return schema.validate(data);
}

module.exports = {
  WeakTopic,
  validate: validateWeakTopic,
};