const mongoose = require("mongoose");
const Joi = require("joi");

const lessonNoteSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },

    pdfUrl: {
      type: String,
      maxlength: 500,
    },

   attachments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment",
  },
],

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const LessonNote =
  mongoose.models.LessonNote ||
  mongoose.model("LessonNote", lessonNoteSchema);

function validateLessonNote(data) {
  const schema = Joi.object({
    lesson: Joi.string().hex().length(24).required(),
    title: Joi.string().min(2).max(150).required(),
    content: Joi.string().max(10000).required(),
    pdfUrl: Joi.string().max(500).optional().allow(""),
    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  LessonNote,
  validate: validateLessonNote,
};