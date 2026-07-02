const mongoose = require("mongoose");
const Joi = require("joi");

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },
  questionType: {
    type: String,
    enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"],
    required: true,
  },
   options: {
    type: [String],
    default: undefined,
  },
  correctAnswer: String,
  marks: {
    type: Number,
    default: 1,
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    type: {
      type: String,
      enum: ["ASSIGNMENT", "TEST"],
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

    instructions: {
      type: String,
      maxlength: 2000,
    },

    questions: [questionSchema],

    totalMarks: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Assignment =
  mongoose.models.Assignment ||
  mongoose.model("Assignment", assignmentSchema);

function validateAssignment(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    type: Joi.string().valid("ASSIGNMENT", "TEST").required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    instructions: Joi.string().max(2000).optional().allow(""),
    questions: Joi.array()
      .items(
        Joi.object({
          questionText: Joi.string().required(),
          questionType: Joi.string()
            .valid("MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY")
            .required(),
          options: Joi.array().items(Joi.string()).optional(),
          correctAnswer: Joi.string().optional().allow(""),
          marks: Joi.number().min(1).optional(),
        })
      )
      .optional(),
    totalMarks: Joi.number().min(0).optional(),
    dueDate: Joi.date().required(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Assignment,
  validate: validateAssignment,
};