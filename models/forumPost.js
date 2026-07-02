const mongoose = require("mongoose");
const Joi = require("joi");

const forumPostSchema = new mongoose.Schema(
  {
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumTopic",
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],

    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ForumPost",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    is_answer: {
      type: Boolean,
      default: false,
    },

    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ForumPost =
  mongoose.models.ForumPost ||
  mongoose.model("ForumPost", forumPostSchema);

function validateForumPost(data) {
  const schema = Joi.object({
    topic: Joi.string().hex().length(24).required(),
    author: Joi.string().hex().length(24).required(),
    content: Joi.string().max(5000).required(),
    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),
    parentPost: Joi.string().hex().length(24).optional().allow(""),
    is_answer: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  ForumPost,
  validate: validateForumPost,
};