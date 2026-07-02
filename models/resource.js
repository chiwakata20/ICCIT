const mongoose = require("mongoose");
const Joi = require("joi");

const resourceSchema = new mongoose.Schema(
  {
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SyllabusTopic",
    },

    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 200,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 1500,
      trim: true,
    },

    resource_type: {
      type: String,
      enum: ["NOTE", "PDF", "VIDEO", "IMAGE", "LINK", "AUDIO", "PRESENTATION"],
      required: true,
    },

    content: {
      type: String,
      trim: true,
    },

    file_url: {
      type: String,
      trim: true,
    },

    video_url: {
      type: String,
      trim: true,
    },

    external_url: {
      type: String,
      trim: true,
    },

    access_type: {
      type: String,
      enum: ["FREE", "PREMIUM"],
      default: "FREE",
    },

    approved: {
      type: Boolean,
      default: false,
    },

    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    downloads: {
      type: Number,
      default: 0,
      min: 0,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ subject_id: 1, topic_id: 1, resource_type: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

function validateResource(resource) {
  const schema = Joi.object({
    subject_id: Joi.string().hex().length(24).required(),

    topic_id: Joi.string().hex().length(24).optional().allow(null, ""),

    title: Joi.string().min(3).max(200).required(),

    description: Joi.string().max(1500).optional().allow(""),

    resource_type: Joi.string()
      .valid("NOTE", "PDF", "VIDEO", "IMAGE", "LINK", "AUDIO", "PRESENTATION")
      .required(),

    content: Joi.string().optional().allow(""),

    file_url: Joi.string().uri().optional().allow(""),

    video_url: Joi.string().uri().optional().allow(""),

    external_url: Joi.string().uri().optional().allow(""),

    access_type: Joi.string().valid("FREE", "PREMIUM").optional(),

    approved: Joi.boolean().optional(),

    uploaded_by: Joi.string().hex().length(24).optional().allow(null, ""),

    views: Joi.number().min(0).optional(),

    downloads: Joi.number().min(0).optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(resource);
}

module.exports = {
  Resource,
  validateResource,
};