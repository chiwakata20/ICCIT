const mongoose = require("mongoose");
const Joi = require("joi");

const subscriptionSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 150,
    },

    planName: {
      type: String,
      enum: ["STARTER", "STANDARD", "PREMIUM", "ENTERPRISE"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["USD", "ZWL"],
      default: "USD",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID", "PARTLY_PAID"],
      default: "UNPAID",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);

function validateSubscription(data) {
  const schema = Joi.object({
    schoolName: Joi.string().min(2).max(150).required(),
    planName: Joi.string()
      .valid("STARTER", "STANDARD", "PREMIUM", "ENTERPRISE")
      .required(),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().valid("USD", "ZWL").optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    paymentStatus: Joi.string()
      .valid("PAID", "UNPAID", "PARTLY_PAID")
      .optional(),
    status: Joi.string().valid("ACTIVE", "EXPIRED", "CANCELLED").optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Subscription,
  validate: validateSubscription,
};