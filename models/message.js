const mongoose = require("mongoose");
const Joi = require("joi");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subject: {
      type: String,
      maxlength: 150,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    attachments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment",
  },
],

    is_read: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

function validateMessage(data) {
  const schema = Joi.object({
    sender: Joi.string().hex().length(24).required(),
    recipient: Joi.string().hex().length(24).required(),
    subject: Joi.string().max(150).optional().allow(""),
    message: Joi.string().max(3000).required(),
    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),
    is_read: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Message,
  validate: validateMessage,
};