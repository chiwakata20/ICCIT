const mongoose = require("mongoose");
const Joi = require("joi");

const parentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 20,
    },

    address: {
      type: String,
      maxlength: 255,
    },

    occupation: {
      type: String,
      maxlength: 100,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const ParentProfile =
  mongoose.models.ParentProfile ||
  mongoose.model("ParentProfile", parentProfileSchema);

function validateParentProfile(profile) {
  const schema = Joi.object({
    user: Joi.string().hex().length(24).required(),
    phone: Joi.string().min(7).max(20).required(),
    address: Joi.string().max(255).optional().allow(""),
    occupation: Joi.string().max(100).optional().allow(""),
    students: Joi.array().items(Joi.string().hex().length(24)),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(profile);
}

module.exports = {
  ParentProfile,
  validate: validateParentProfile,
};