const express = require("express");
const router = express.Router();

const {
  Attendance,
  validate,
  validateBulk,
} = require("../models/attendance");

const { User } = require("../models/user");
const { Class } = require("../models/class");

// GET ALL ATTENDANCE RECORDS
router.get("/", async (req, res) => {
  const attendances = await Attendance.find()
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("class", "name syllabus")
    .sort("-date");

  res.send(attendances);
});

// GET ATTENDANCE BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const attendances = await Attendance.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("class", "name syllabus")
    .sort("-date");

  res.send(attendances);
});

// GET ATTENDANCE BY CLASS
router.get("/class/:classId", async (req, res) => {
  const attendances = await Attendance.find({
    class: req.params.classId,
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("class", "name syllabus")
    .sort("-date");

  res.send(attendances);
});

// GET DAILY CLASS ATTENDANCE
router.get("/class/:classId/date/:date", async (req, res) => {
  const start = new Date(req.params.date);
  const end = new Date(req.params.date);
  end.setDate(end.getDate() + 1);

  const attendances = await Attendance.find({
    class: req.params.classId,
    date: {
      $gte: start,
      $lt: end,
    },
  })
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("class", "name syllabus")
    .sort("student");

  res.send(attendances);
});

// GET ATTENDANCE SUMMARY FOR STUDENT
router.get("/student/:studentId/summary", async (req, res) => {
  const records = await Attendance.find({
    student: req.params.studentId,
  });

  const totalDays = records.length;

  const present = records.filter((r) => r.status === "PRESENT").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const excused = records.filter((r) => r.status === "EXCUSED").length;

  const attendanceRate =
    totalDays > 0
      ? Math.round(((present + late) / totalDays) * 100)
      : 0;

  res.send({
    student: req.params.studentId,
    totalDays,
    present,
    absent,
    late,
    excused,
    attendanceRate,
  });
});

// GET SINGLE ATTENDANCE RECORD
router.get("/:id", async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate("student", "name email role")
    .populate("teacher", "name email role")
    .populate("class", "name syllabus");

  if (!attendance) {
    return res.status(404).send("Attendance record not found.");
  }

  res.send(attendance);
});

// CREATE SINGLE ATTENDANCE RECORD
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  if (req.body.teacher) {
    const teacher = await User.findById(req.body.teacher);
    if (!teacher) return res.status(400).send("Invalid teacher.");

    if (teacher.role !== "teacher") {
      return res.status(400).send("User must have role teacher.");
    }
  }

  const start = new Date(req.body.date);
  const end = new Date(req.body.date);
  end.setDate(end.getDate() + 1);

  const existing = await Attendance.findOne({
    student: req.body.student,
    class: req.body.class,
    date: {
      $gte: start,
      $lt: end,
    },
  });

  if (existing) {
    return res
      .status(400)
      .send("Attendance already recorded for this student on this date.");
  }

  const attendance = new Attendance({
    student: req.body.student,
    class: req.body.class,
    teacher: req.body.teacher,
    date: req.body.date,
    status: req.body.status,
    remarks: req.body.remarks,
  });

  await attendance.save();

  res.send(attendance);
});

// CREATE BULK ATTENDANCE FOR A CLASS
router.post("/bulk", async (req, res) => {
  const { error } = validateBulk(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classData = await Class.findById(req.body.class);
  if (!classData) return res.status(400).send("Invalid class.");

  if (req.body.teacher) {
    const teacher = await User.findById(req.body.teacher);
    if (!teacher) return res.status(400).send("Invalid teacher.");

    if (teacher.role !== "teacher") {
      return res.status(400).send("User must have role teacher.");
    }
  }

  const start = new Date(req.body.date);
  const end = new Date(req.body.date);
  end.setDate(end.getDate() + 1);

  const savedRecords = [];
  const skippedRecords = [];

  for (const item of req.body.records) {
    const student = await User.findById(item.student);

    if (!student || student.role !== "student") {
      skippedRecords.push({
        student: item.student,
        reason: "Invalid student",
      });
      continue;
    }

    const existing = await Attendance.findOne({
      student: item.student,
      class: req.body.class,
      date: {
        $gte: start,
        $lt: end,
      },
    });

    if (existing) {
      skippedRecords.push({
        student: item.student,
        reason: "Attendance already recorded",
      });
      continue;
    }

    const attendance = new Attendance({
      student: item.student,
      class: req.body.class,
      teacher: req.body.teacher,
      date: req.body.date,
      status: item.status,
      remarks: item.remarks,
    });

    await attendance.save();
    savedRecords.push(attendance);
  }

  res.send({
    saved: savedRecords.length,
    skipped: skippedRecords.length,
    savedRecords,
    skippedRecords,
  });
});

// UPDATE ATTENDANCE RECORD
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      class: req.body.class,
      teacher: req.body.teacher,
      date: req.body.date,
      status: req.body.status,
      remarks: req.body.remarks,
    },
    { new: true }
  );

  if (!attendance) {
    return res.status(404).send("Attendance record not found.");
  }

  res.send(attendance);
});

// DELETE ATTENDANCE RECORD
router.delete("/:id", async (req, res) => {
  const attendance = await Attendance.findByIdAndDelete(req.params.id);

  if (!attendance) {
    return res.status(404).send("Attendance record not found.");
  }

  res.send(attendance);
});

module.exports = router;