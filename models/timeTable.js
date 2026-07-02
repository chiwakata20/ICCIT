const mongoose = require("mongoose");
const Joi = require("joi");

const timetableSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SUNDAY",
      ],
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    room: {
      type: String,
      maxlength: 50,
    },

    lessonType: {
      type: String,
      enum: ["NORMAL", "PRACTICAL", "REVISION", "TEST", "EXAM"],
      default: "NORMAL",
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

timetableSchema.index(
  { class: 1, day: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

const Timetable =
  mongoose.models.Timetable ||
  mongoose.model("Timetable", timetableSchema);

function validateTimetable(data) {
  const schema = Joi.object({
    class: Joi.string().hex().length(24).required(),
    subject: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).required(),

    day: Joi.string()
      .valid(
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SUNDAY"
      )
      .required(),

    startTime: Joi.string().required(),
    endTime: Joi.string().required(),

    room: Joi.string().max(50).optional().allow(""),

    lessonType: Joi.string()
      .valid("NORMAL", "PRACTICAL", "REVISION", "TEST", "EXAM")
      .optional(),

    is_active: Joi.boolean().optional(),
  });

  return schema.validate(data);
}

module.exports = {
  Timetable,
  validate: validateTimetable,
};