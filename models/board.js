const mongoose = require("mongoose");
const Joi = require("joi");

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE"],
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true,
    },

    country_focus: {
      type: String,
      default: "Zimbabwe",
      trim: true,
    },

    website_url: {
      type: String,
      trim: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Board =
  mongoose.models.Board || mongoose.model("Board", boardSchema);

function validateBoard(board) {
  const schema = Joi.object({
    name: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),

    description: Joi.string().min(10).max(500).required(),

    country_focus: Joi.string().max(100).optional(),

    website_url: Joi.string().uri().optional().allow(""),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(board);
}

module.exports = {
  Board,
  validateBoard,
};