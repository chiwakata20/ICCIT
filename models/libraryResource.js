const mongoose = require("mongoose");
const Joi = require("joi");

const libraryResourceSchema = new mongoose.Schema(
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

    resourceType: {
      type: String,
      enum: ["BOOK", "NOTES", "PAST_PAPER", "MARKING_SCHEME", "VIDEO", "OTHER"],
      required: true,
    },

    syllabus: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE", "BOTH"],
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
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attachment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attachment",
      required: true,
    },

    tags: {
      type: [String],
      default: undefined,
    },

    is_published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const LibraryResource =
  mongoose.models.LibraryResource ||
  mongoose.model("LibraryResource", libraryResourceSchema);

function validateLibraryResource(data) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(2000).optional().allow(""),
    resourceType: Joi.string()
      .valid("BOOK", "NOTES", "PAST_PAPER", "MARKING_SCHEME", "VIDEO", "OTHER")
      .required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE", "BOTH").required(),
    subject: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).optional().allow(""),
    uploadedBy: Joi.string().hex().length(24).required(),
    attachment: Joi.string().hex().length(24).required(),
    tags: Joi.array().items(Joi.string()).optional(),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  LibraryResource,
  validate: validateLibraryResource,
};