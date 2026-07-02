const mongoose = require("mongoose");
const Joi = require("joi");

const subjectPerformanceSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },

  averageScore: {
    type: Number,
    default: 0,
  },

  totalTests: {
    type: Number,
    default: 0,
  },

  highestScore: {
    type: Number,
    default: 0,
  },

  lowestScore: {
    type: Number,
    default: 0,
  },

  grade: {
    type: String,
  },

  teacherComment: {
    type: String,
  },
});

const studentAnalyticsSchema = new mongoose.Schema(
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

    attendanceRate: {
      type: Number,
      default: 0,
    },

    homeworkCompletionRate: {
      type: Number,
      default: 0,
    },

    overallAverage: {
      type: Number,
      default: 0,
    },

    overallGrade: {
      type: String,
    },

    performanceStatus: {
      type: String,
      enum: ["EXCELLENT", "GOOD", "AVERAGE", "WEAK", "CRITICAL"],
      default: "AVERAGE",
    },

    subjectPerformances: [subjectPerformanceSchema],

    weakSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    strongSubjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    recommendation: {
      type: String,
    },
  },
  { timestamps: true }
);

const StudentAnalytics =
  mongoose.models.StudentAnalytics ||
  mongoose.model("StudentAnalytics", studentAnalyticsSchema);

function validateStudentAnalytics(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    term: Joi.string().valid("TERM_1", "TERM_2", "TERM_3").required(),
    year: Joi.number().required(),
  });

  return schema.validate(data);
}

module.exports = {
  StudentAnalytics,
  validate: validateStudentAnalytics,
};