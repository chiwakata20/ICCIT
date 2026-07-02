const mongoose = require("mongoose");
const Joi = require("joi");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },

    syllabus: {
      type: String,
      enum: ["ZIMSEC", "CAMBRIDGE"],
      required: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Class =
  mongoose.models.Class || mongoose.model("Class", classSchema);

function validateClass(data) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    syllabus: Joi.string().valid("ZIMSEC", "CAMBRIDGE").required(),
    students: Joi.array().items(Joi.string().hex().length(24)),
    teacher: Joi.string().hex().length(24).required(),
  });

  return schema.validate(data);
}

module.exports = {
  Class,
  validate: validateClass,
};