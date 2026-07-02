const mongoose = require("mongoose");
const Joi = require("joi");

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true
  },

  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  }],

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

const StudentProfile = mongoose.model(
  "StudentProfile",
  studentProfileSchema
);

function validateStudentProfile(profile) {
  const schema = Joi.object({
    user: Joi.string().required(),
    class: Joi.string().required(),
    subjects: Joi.array().items(Joi.string()),
    parent: Joi.string().allow(null, "")
  });

  return schema.validate(profile);
}

exports.StudentProfile = StudentProfile;
exports.validate = validateStudentProfile;