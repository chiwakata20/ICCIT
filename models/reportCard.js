const mongoose = require("mongoose");
const Joi = require("joi");

const reportSubjectSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },

  score: {
    type: Number,
    required: true,
  },

  totalMarks: {
    type: Number,
    required: true,
  },

  percentage: {
    type: Number,
    required: true,
  },

  grade: {
    type: String,
  },

  teacherComment: {
    type: String,
  },
});

const reportCardSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3"],
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    subjects: [reportSubjectSchema],

    overallAverage: {
      type: Number,
      default: 0,
    },

    overallGrade: {
      type: String,
    },

    attendanceRate: {
      type: Number,
      default: 0,
    },

    homeworkCompletionRate: {
      type: Number,
      default: 0,
    },

    classTeacherComment: {
      type: String,
      maxlength: 1000,
    },

    headComment: {
      type: String,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

reportCardSchema.index(
  { student: 1, class: 1, term: 1, year: 1 },
  { unique: true }
);

const ReportCard =
  mongoose.models.ReportCard ||
  mongoose.model("ReportCard", reportCardSchema);

function validateReportCard(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    term: Joi.string().valid("TERM_1", "TERM_2", "TERM_3").required(),
    year: Joi.number().required(),
    classTeacherComment: Joi.string().max(1000).optional().allow(""),
    headComment: Joi.string().max(1000).optional().allow(""),
    status: Joi.string().valid("DRAFT", "PUBLISHED").optional(),
  });

  return schema.validate(data);
}

module.exports = {
  ReportCard,
  validate: validateReportCard,
};