const mongoose = require("mongoose");
const Joi = require("joi");

const syllabusTopicSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      maxlength: 1500,
      trim: true,
    },

    paper: {
      type: String,
      enum: ["PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PRACTICAL", "COURSEWORK", "ALL"],
      default: "ALL",
    },

    difficulty: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },

    order_number: {
      type: Number,
      required: true,
      min: 1,
    },

    learning_objectives: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],

    key_terms: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

syllabusTopicSchema.index({ subject_id: 1, order_number: 1 });

const SyllabusTopic =
  mongoose.models.SyllabusTopic ||
  mongoose.model("SyllabusTopic", syllabusTopicSchema);

function validateSyllabusTopic(topic) {
  const schema = Joi.object({
    subject_id: Joi.string().hex().length(24).required(),

    title: Joi.string().min(2).max(200).required(),

    code: Joi.string().max(50).optional().allow(""),

    description: Joi.string().max(1500).optional().allow(""),

    paper: Joi.string()
      .valid("PAPER_1", "PAPER_2", "PAPER_3", "PAPER_4", "PRACTICAL", "COURSEWORK", "ALL")
      .optional(),

    difficulty: Joi.string()
      .valid("BEGINNER", "INTERMEDIATE", "ADVANCED")
      .optional(),

    order_number: Joi.number().min(1).required(),

    learning_objectives: Joi.array().items(Joi.string().max(500)).optional(),

    key_terms: Joi.array().items(Joi.string().max(100)).optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(topic);
}

module.exports = {
  SyllabusTopic,
  validateSyllabusTopic,
};