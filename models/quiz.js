const mongoose = require("mongoose");
const Joi = require("joi");

const quizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true,
  },

  questionType: {
    type: String,
    enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
    required: true,
  },

  options: {
    type: [String],
    default: undefined,
  },

  correctAnswer: {
    type: String,
    required: true,
  },

  marks: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
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
      maxlength: 1000,
    },

    questions: [quizQuestionSchema],

    totalMarks: {
      type: Number,
      default: 0,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      default: 30,
    },

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

function validateQuiz(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    lesson: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    instructions: Joi.string().max(1000).optional().allow(""),

    questions: Joi.array()
      .items(
        Joi.object({
          questionText: Joi.string().required(),
          questionType: Joi.string()
            .valid("MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER")
            .required(),
          options: Joi.array().items(Joi.string()).optional(),
          correctAnswer: Joi.string().required(),
          marks: Joi.number().min(1).optional(),
        })
      )
      .min(1)
      .required(),

    totalMarks: Joi.number().min(0).optional(),
    durationMinutes: Joi.number().min(1).optional(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Quiz,
  validate: validateQuiz,
};