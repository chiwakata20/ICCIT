const mongoose = require("mongoose");
const Joi = require("joi");

const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    phone: {
      type: String,
      minlength: 7,
      maxlength: 20,
    },

    qualification: {
      type: String,
      maxlength: 150,
    },

    experience_years: {
      type: Number,
      min: 0,
      default: 0,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TeacherProfile =
  mongoose.models.TeacherProfile ||
  mongoose.model("TeacherProfile", teacherProfileSchema);

function validateTeacherProfile(profile) {
  const schema = Joi.object({
    user: Joi.string().hex().length(24).required(),
    subjects: Joi.array().items(Joi.string().hex().length(24)),
    classes: Joi.array().items(Joi.string().hex().length(24)),
    phone: Joi.string().min(7).max(20).optional().allow(""),
    qualification: Joi.string().max(150).optional().allow(""),
    experience_years: Joi.number().min(0).optional(),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(profile);
}

module.exports = {
  TeacherProfile,
  validate: validateTeacherProfile,
};