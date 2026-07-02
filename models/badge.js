const mongoose = require("mongoose");
const Joi = require("joi");

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    badgeType: {
      type: String,
      enum: [
        "ACADEMIC",
        "ATTENDANCE",
        "HOMEWORK",
        "QUIZ",
        "BEHAVIOUR",
        "LEADERSHIP",
        "SPORTS",
        "OTHER",
      ],
      required: true,
    },
   

    iconUrl: {
      type: String,
      maxlength: 500,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.models.Badge || mongoose.model("Badge", badgeSchema);

function validateBadge(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(1000).optional().allow(""),
    badgeType: Joi.string()
      .valid(
        "ACADEMIC",
        "ATTENDANCE",
        "HOMEWORK",
        "QUIZ",
        "BEHAVIOUR",
        "LEADERSHIP",
        "SPORTS",
        "OTHER"
      )
      .required(),
    iconUrl: Joi.string().max(500).optional().allow(""),
    is_active: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Badge,
  validate: validateBadge,
};