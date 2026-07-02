const mongoose = require("mongoose");
const Joi = require("joi");

const schemeWeekSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  topic: { type: String, required: true, maxlength: 200 },
  objectives: { type: String, required: true, maxlength: 1000 },
  competencies: { type: String, maxlength: 1000 },
  activities: { type: String, maxlength: 1500 },
  resources: { type: String, maxlength: 1000 },
  assessment: { type: String, maxlength: 1000 },
  evaluation:{type: String,maxlength:1000},
});

const schemeOfWorkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, minlength: 2, maxlength: 150 },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    syllabus: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE"],
      required: true,
    },

    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3"],
      required: true,
    },

    year: { type: Number, required: true },

    weeks: [schemeWeekSchema],

    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"],
      default: "DRAFT",
    },

    adminComment: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

const SchemeOfWork =
  mongoose.models.SchemeOfWork ||
  mongoose.model("SchemeOfWork", schemeOfWorkSchema);

function validateSchemeOfWork(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    teacher: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),
    term: Joi.string().valid("TERM_1", "TERM_2", "TERM_3").required(),
    year: Joi.number().required(),

    weeks: Joi.array().items(
      Joi.object({
        weekNumber: Joi.number().required(),
        topic: Joi.string().max(200).required(),
        objectives: Joi.string().max(1000).required(),
        competencies: Joi.string().max(1000).optional().allow(""),
        activities: Joi.string().max(1500).optional().allow(""),
        resources: Joi.string().max(1000).optional().allow(""),
        assessment: Joi.string().max(1000).optional().allow(""),
         evaluation: Joi.string().max(1000).optional().allow(""),
      })
    ),

    status: Joi.string()
      .valid("DRAFT", "SUBMITTED", "APPROVED", "REJECTED")
      .optional(),

    adminComment: Joi.string().max(1000).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  SchemeOfWork,
  validate: validateSchemeOfWork,
};