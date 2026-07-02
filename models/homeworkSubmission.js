const mongoose = require("mongoose");
const Joi = require("joi");

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    homework: {
      type: mongoose.Schema.Types.ObjectId,
       ref: "Homework",
},
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["NOT_SUBMITTED", "SUBMITTED", "MARKED", "LATE"],
      default: "NOT_SUBMITTED",
    },

    submittedAt: {
      type: Date,
    },

    fileUrl: {
      type: String,
      maxlength: 500,
    },

    marksAwarded: {
      type: Number,
      default: 0,
    },

    teacherFeedback: {
      type: String,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

const HomeworkSubmission =
  mongoose.models.HomeworkSubmission ||
  mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);

function validateHomeworkSubmission(data) {
  const schema = Joi.object({
    homework: Joi.string().hex().length(24).required(),
    assignment: Joi.string().hex().length(24).required(),
    student: Joi.string().hex().length(24).required(),
    status: Joi.string()
      .valid("NOT_SUBMITTED", "SUBMITTED", "MARKED", "LATE")
      .optional(),
    submittedAt: Joi.date().optional(),
    fileUrl: Joi.string().max(500).optional().allow(""),
    marksAwarded: Joi.number().min(0).optional(),
    teacherFeedback: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  HomeworkSubmission,
  validate: validateHomeworkSubmission,
};