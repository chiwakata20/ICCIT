const mongoose = require("mongoose");
const Joi = require("joi");

const lessonSchema = new mongoose.Schema(
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

    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    videoUrl: {
      type: String,
      maxlength: 500,
    },

    attachments: [
      {
        type: String,
      },
    ],

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Lesson =
  mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);

function validateLesson(lesson) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    content: Joi.string().max(5000).required(),
    videoUrl: Joi.string().max(500).optional().allow(""),
    attachments: Joi.array().items(Joi.string()).optional(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(lesson);
}

module.exports = {
  Lesson,
  validate: validateLesson,
};