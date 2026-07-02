const mongoose = require("mongoose");
const Joi = require("joi");

const communicationNoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
    },

    body: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    noticeType: {
      type: String,
      enum: [
        "GENERAL",
        "FEES",
        "EXAM",
        "EVENT",
        "DISCIPLINE",
        "EMERGENCY",
        "MEETING",
      ],
      default: "GENERAL",
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    audience: {
      type: String,
      enum: ["ALL", "STUDENTS", "PARENTS", "TEACHERS", "CLASS"],
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    attachments: {
      type: [String],
      default: undefined,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

const CommunicationNotice =
  mongoose.models.CommunicationNotice ||
  mongoose.model("CommunicationNotice", communicationNoticeSchema);

function validateCommunicationNotice(data) {
  const schema = Joi.object({
    title: Joi.string().max(150).required(),
    body: Joi.string().max(5000).required(),
    noticeType: Joi.string()
      .valid(
        "GENERAL",
        "FEES",
        "EXAM",
        "EVENT",
        "DISCIPLINE",
        "EMERGENCY",
        "MEETING"
      )
      .optional(),
    sender: Joi.string().hex().length(24).required(),
    audience: Joi.string()
      .valid("ALL", "STUDENTS", "PARENTS", "TEACHERS", "CLASS")
      .required(),
    class: Joi.string().hex().length(24).optional().allow(""),
    attachments: Joi.array().items(Joi.string()).optional(),
    status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").optional(),
  });

  return schema.validate(data);
}

module.exports = {
  CommunicationNotice,
  validate: validateCommunicationNotice,
};