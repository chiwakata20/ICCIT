const express = require("express");
const router = express.Router();

const {
  TeacherProfile,
  validate,
} = require("../models/teacherProfile");

const { User } = require("../models/user");

// GET ALL TEACHER PROFILES
router.get("/", async (req, res) => {
  const profiles = await TeacherProfile.find()
    .populate("user", "name email role")
    .populate("subjects", "name code level category")
    .populate("classes", "name syllabus")
    .sort("-createdAt");

  res.send(profiles);
});

// GET SINGLE TEACHER PROFILE
router.get("/:id", async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.id)
    .populate("user", "name email role")
    .populate("subjects", "name code level category")
    .populate("classes", "name syllabus");

  if (!profile) return res.status(404).send("Teacher profile not found.");

  res.send(profile);
});

// CREATE TEACHER PROFILE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.user);
  if (!user) return res.status(400).send("Invalid teacher user.");

  if (user.role !== "teacher") {
    return res.status(400).send("User must have role teacher.");
  }

  let profile = await TeacherProfile.findOne({ user: req.body.user });
  if (profile) return res.status(400).send("Teacher profile already exists.");

  profile = new TeacherProfile({
    user: req.body.user,
    subjects: req.body.subjects,
    classes: req.body.classes,
    phone: req.body.phone,
    qualification: req.body.qualification,
    experience_years: req.body.experience_years,
    is_active: req.body.is_active,
  });

  await profile.save();

  res.send(profile);
});

// UPDATE TEACHER PROFILE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = await TeacherProfile.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      subjects: req.body.subjects,
      classes: req.body.classes,
      phone: req.body.phone,
      qualification: req.body.qualification,
      experience_years: req.body.experience_years,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!profile) return res.status(404).send("Teacher profile not found.");

  res.send(profile);
});

// DELETE TEACHER PROFILE
router.delete("/:id", async (req, res) => {
  const profile = await TeacherProfile.findByIdAndDelete(req.params.id);

  if (!profile) return res.status(404).send("Teacher profile not found.");

  res.send(profile);
});

module.exports = router;