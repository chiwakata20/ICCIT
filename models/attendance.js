const mongoose = require("mongoose");
const Joi = require("joi");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
      required: true,
    },

    remarks: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { student: 1, class: 1, date: 1 },
  { unique: true }
);

const Attendance =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);

function validateAttendance(data) {
  const schema = Joi.object({
    student: Joi.string().hex().length(24).required(),
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).optional().allow(""),
    date: Joi.date().required(),
    status: Joi.string()
      .valid("PRESENT", "ABSENT", "LATE", "EXCUSED")
      .required(),
    remarks: Joi.string().max(500).optional().allow(""),
  });

  return schema.validate(data);
}

function validateBulkAttendance(data) {
  const schema = Joi.object({
    class: Joi.string().hex().length(24).required(),
    teacher: Joi.string().hex().length(24).optional().allow(""),
    date: Joi.date().required(),
    records: Joi.array()
      .items(
        Joi.object({
          student: Joi.string().hex().length(24).required(),
          status: Joi.string()
            .valid("PRESENT", "ABSENT", "LATE", "EXCUSED")
            .required(),
          remarks: Joi.string().max(500).optional().allow(""),
        })
      )
      .min(1)
      .required(),
  });

  return schema.validate(data);
}

module.exports = {
  Attendance,
  validate: validateAttendance,
  validateBulk: validateBulkAttendance,
};