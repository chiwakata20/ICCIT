const mongoose = require("mongoose");
const Joi = require("joi");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 3000,
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

    priority: {
      type: String,
      enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },

   attachments: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment",
  },
],

    is_published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement =
  mongoose.models.Announcement ||
  mongoose.model("Announcement", announcementSchema);

function validateAnnouncement(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(150).required(),
    message: Joi.string().max(3000).required(),
    sender: Joi.string().hex().length(24).required(),
    audience: Joi.string()
      .valid("ALL", "STUDENTS", "PARENTS", "TEACHERS", "CLASS")
      .required(),
    class: Joi.string().hex().length(24).optional().allow(""),
    priority: Joi.string().valid("LOW", "NORMAL", "HIGH", "URGENT").optional(),
    attachments: Joi.array().items(Joi.string().hex().length(24)).optional(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Announcement,
  validate: validateAnnouncement,
};