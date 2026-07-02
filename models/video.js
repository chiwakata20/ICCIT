const mongoose = require("mongoose");
const Joi = require("joi");

const videoSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    title: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },

    videoUrl: {
      type: String,
      required: true,
      maxlength: 500,
    },

    thumbnailUrl: {
      type: String,
      maxlength: 500,
    },

    duration: {
      type: String,
      maxlength: 50,
    },

    is_published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Video =
  mongoose.models.Video || mongoose.model("Video", videoSchema);

function validateVideo(data) {
  const schema = Joi.object({
    lesson: Joi.string().hex().length(24).required(),
    title: Joi.string().min(2).max(150).required(),
    description: Joi.string().max(1000).optional().allow(""),
    videoUrl: Joi.string().max(500).required(),
    thumbnailUrl: Joi.string().max(500).optional().allow(""),
    duration: Joi.string().max(50).optional().allow(""),
    is_published: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Video,
  validate: validateVideo,
};