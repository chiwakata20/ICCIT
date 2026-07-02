const mongoose = require("mongoose");
const Joi = require("joi");

const forumTopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 2000,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visibility: {
      type: String,
      enum: ["PUBLIC", "CLASS", "SUBJECT"],
      default: "PUBLIC",
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "ARCHIVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

const ForumTopic =
  mongoose.models.ForumTopic ||
  mongoose.model("ForumTopic", forumTopicSchema);

function validateForumTopic(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(2000).optional().allow(""),
    subject: Joi.string().hex().length(24).optional().allow(""),
    class: Joi.string().hex().length(24).optional().allow(""),
    createdBy: Joi.string().hex().length(24).required(),
    visibility: Joi.string().valid("PUBLIC", "CLASS", "SUBJECT").optional(),
    status: Joi.string().valid("OPEN", "CLOSED", "ARCHIVED").optional(),
  });

  return schema.validate(data);
}

module.exports = {
  ForumTopic,
  validate: validateForumTopic,
};