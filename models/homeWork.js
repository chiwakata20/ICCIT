const mongoose = require("mongoose");
const Joi = require("joi");

const homeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
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

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },

    attachments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment",
  },
],

    instructions: {
      type: String,
      required: true,
      maxlength: 3000,
    },

   

    dueDate: {
      type: Date,
      required: true,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Homework =
  mongoose.models.Homework || mongoose.model("Homework", homeworkSchema);

function validateHomework(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    lesson: Joi.string().hex().length(24).optional().allow(""),
    instructions: Joi.string().max(3000).required(),
    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),
    dueDate: Joi.date().required(),
    totalMarks: Joi.number().min(0).optional(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "CLOSED").optional(),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Homework,
  validate: validateHomework,
};