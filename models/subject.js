const mongoose = require("mongoose");
const Joi = require("joi");

const subjectSchema = new mongoose.Schema(
  {
    board_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },

    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    level: {
      type: String,
      enum: ["ORDINARY_LEVEL", "ADVANCED_LEVEL", "AS_LEVEL", "A_LEVEL", "IGCSE"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "SCIENCES",
        "MATHEMATICS",
        "COMMERCIALS",
        "HUMANITIES",
        "LANGUAGES",
        "TECHNICAL_VOCATIONAL",
        "ARTS",
        "RELIGIOUS_STUDIES",
        "OTHER",
      ],
      required: true,
    },

    form_range: {
      type: String,
      enum: ["FORM_1_TO_4", "FORM_3_TO_4", "FORM_5_TO_6", "OTHER"],
      required: true,
    },

    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    is_core_subject: {
      type: Boolean,
      default: false,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

subjectSchema.index({ board_id: 1, code: 1, level: 1 }, { unique: true });

const Subject =mongoose.models.Subject || mongoose.model("Subject", subjectSchema);

function validateSubject(subject) {
  const schema = Joi.object({
    board_id: Joi.objectId
      ? Joi.objectId().required()
      : Joi.string().hex().length(24).required(),

    name: Joi.string().min(2).max(100).required(),

    code: Joi.string().max(30).required(),

    level: Joi.string()
      .valid("ORDINARY_LEVEL", "ADVANCED_LEVEL", "AS_LEVEL", "A_LEVEL", "IGCSE")
      .required(),

    category: Joi.string()
      .valid(
        "SCIENCES",
        "MATHEMATICS",
        "COMMERCIALS",
        "HUMANITIES",
        "LANGUAGES",
        "TECHNICAL_VOCATIONAL",
        "ARTS",
        "RELIGIOUS_STUDIES",
        "OTHER"
      )
      .required(),

    form_range: Joi.string()
      .valid("FORM_1_TO_4", "FORM_3_TO_4", "FORM_5_TO_6", "OTHER")
      .required(),

    description: Joi.string().max(1000).optional().allow(""),

    is_core_subject: Joi.boolean().optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(subject);
}

module.exports = {
  Subject,
  validateSubject,
};