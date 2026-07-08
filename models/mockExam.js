const mongoose = require("mongoose");
const Joi = require("joi");

const mockExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 200 },

    syllabus: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE"],
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

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],

    instructions: { type: String, maxlength: 2000 },

    durationMinutes: { type: Number, required: true, min: 1 },

    totalMarks: { type: Number, default: 0 },

    startDate: { type: Date },

    endDate: { type: Date },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
    },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const MockExam =
  mongoose.models.MockExam || mongoose.model("MockExam", mockExamSchema);

function validateMockExam(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    questions: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
    instructions: Joi.string().max(2000).optional().allow(""),
    durationMinutes: Joi.number().min(1).required(),
    totalMarks: Joi.number().min(0).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "CLOSED").optional(),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  MockExam,
  validate: validateMockExam,
};