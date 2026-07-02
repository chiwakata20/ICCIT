const mongoose = require("mongoose");
const Joi = require("joi");

const attachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    relatedModel: {
      type: String,
      enum: [
        "Lesson",
        "LessonNote",
        "Homework",
        "Assignment",
        "Announcement",
        "CommunicationNotice",
        "Message",
        "Other",
      ],
      default: "Other",
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

const Attachment =
  mongoose.models.Attachment ||
  mongoose.model("Attachment", attachmentSchema);

function validateAttachment(data) {
  const schema = Joi.object({
    uploadedBy: Joi.string().hex().length(24).required(),
    relatedModel: Joi.string()
      .valid(
        "Lesson",
        "LessonNote",
        "Homework",
        "Assignment",
        "Announcement",
        "CommunicationNotice",
        "Message",
        "Other"
      )
      .optional(),
    relatedId: Joi.string().hex().length(24).optional().allow(""),
  });

  return schema.validate(data);
}

module.exports = {
  Attachment,
  validate: validateAttachment,
};