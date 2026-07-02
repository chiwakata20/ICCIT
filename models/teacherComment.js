const mongoose = require("mongoose");
const Joi = require("joi");

const teacherCommentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    visibleToParent: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TeacherComment =
  mongoose.models.TeacherComment ||
  mongoose.model("TeacherComment", teacherCommentSchema);

function validateTeacherComment(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).optional(),
    comment: Joi.string().max(1000).required(),
    visibleToParent: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  TeacherComment,
  validate: validateTeacherComment,
};