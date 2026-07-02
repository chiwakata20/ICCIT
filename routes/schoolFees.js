const express = require("express");
const router = express.Router();

const { SchoolFee, validate } = require("../models/schoolFee");
const { User } = require("../models/user");

// GET ALL SCHOOL FEES
router.get("/", async (req, res) => {
  const fees = await SchoolFee.find()
    .populate("student", "name email role")
    .sort("-createdAt");

  res.send(fees);
});

// GET SINGLE SCHOOL FEE RECORD
router.get("/:id", async (req, res) => {
  const fee = await SchoolFee.findById(req.params.id)
    .populate("student", "name email role");

  if (!fee) return res.status(404).send("School fee record not found.");

  res.send(fee);
});

// GET FEES BY STUDENT
router.get("/student/:studentId", async (req, res) => {
  const fees = await SchoolFee.find({
    student: req.params.studentId,
  })
    .populate("student", "name email role")
    .sort("-createdAt");

  res.send(fees);
});

// CREATE SCHOOL FEE RECORD
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await User.findById(req.body.student);
  if (!student) return res.status(400).send("Invalid student.");

  if (student.role !== "student") {
    return res.status(400).send("User must have role student.");
  }

  const balance = req.body.totalFee - (req.body.amountPaid || 0);

  let status = "UNPAID";
  if (balance === 0) status = "PAID";
  else if ((req.body.amountPaid || 0) > 0) status = "PARTLY_PAID";

  const fee = new SchoolFee({
    student: req.body.student,
    term: req.body.term,
    totalFee: req.body.totalFee,
    amountPaid: req.body.amountPaid || 0,
    balance,
    status,
  });

  await fee.save();

  res.send(fee);
});

// UPDATE SCHOOL FEE RECORD
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const balance = req.body.totalFee - (req.body.amountPaid || 0);

  let status = "UNPAID";
  if (balance === 0) status = "PAID";
  else if ((req.body.amountPaid || 0) > 0) status = "PARTLY_PAID";

  const fee = await SchoolFee.findByIdAndUpdate(
    req.params.id,
    {
      student: req.body.student,
      term: req.body.term,
      totalFee: req.body.totalFee,
      amountPaid: req.body.amountPaid || 0,
      balance,
      status,
    },
    { new: true }
  );

  if (!fee) return res.status(404).send("School fee record not found.");

  res.send(fee);
});

// DELETE SCHOOL FEE RECORD
router.delete("/:id", async (req, res) => {
  const fee = await SchoolFee.findByIdAndDelete(req.params.id);

  if (!fee) return res.status(404).send("School fee record not found.");

  res.send(fee);
});

module.exports = router;