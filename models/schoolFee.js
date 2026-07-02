const mongoose = require("mongoose");
const Joi = require("joi");

const schoolFeeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    term: {
      type: String,
      enum: ["TERM_1", "TERM_2", "TERM_3"],
      required: true,
    },

    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["PAID", "PARTLY_PAID", "UNPAID"],
      default: "UNPAID",
    },
  },
  { timestamps: true }
);

const SchoolFee =
  mongoose.models.SchoolFee ||
  mongoose.model("SchoolFee", schoolFeeSchema);

function validateSchoolFee(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    term: Joi.string().valid("TERM_1", "TERM_2", "TERM_3").required(),
    totalFee: Joi.number().min(0).required(),
    amountPaid: Joi.number().min(0).optional(),
  });

  return schema.validate(data);
}

module.exports = {
  SchoolFee,
  validate: validateSchoolFee,
};