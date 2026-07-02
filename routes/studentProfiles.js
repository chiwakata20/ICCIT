const express = require("express");
const router = express.Router();

const {
  StudentProfile,
  validate
} = require("../models/studentProfile");

const { User } = require("../models/user");
const { Subject } = require("../models/subject");

// GET ALL STUDENT PROFILES
router.get("/", async (req, res) => {
  const profiles = await StudentProfile.find()
    .populate("user", "name email role")
    .populate("parent", "name email")
    .populate("subjects", "title syllabus")
    .populate("class");

  res.send(profiles);
});

// GET SINGLE PROFILE
router.get("/:id", async (req, res) => {
  const profile = await StudentProfile.findById(req.params.id)
    .populate("user", "name email role")
    .populate("parent", "name email")
    .populate("subjects", "title syllabus")
    .populate("class");

  if (!profile)
    return res.status(404).send("Student profile not found.");

  res.send(profile);
});

// CREATE PROFILE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);

  if (error)
    return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.user);

  if (!user)
    return res.status(400).send("Invalid student.");

  let profile = await StudentProfile.findOne({
    user: req.body.user
  });

  if (profile)
    return res.status(400).send("Student profile already exists.");

  profile = new StudentProfile({
    user: req.body.user,
    class: req.body.class,
    subjects: req.body.subjects,
    parent: req.body.parent
  });

  await profile.save();

  res.send(profile);
});

// UPDATE PROFILE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);

  if (error)
    return res.status(400).send(error.details[0].message);

  const profile = await StudentProfile.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      class: req.body.class,
      subjects: req.body.subjects,
      parent: req.body.parent
    },
    { new: true }
  );

  if (!profile)
    return res.status(404).send("Student profile not found.");

  res.send(profile);
});

// DELETE PROFILE
router.delete("/:id", async (req, res) => {
  const profile = await StudentProfile.findByIdAndDelete(
    req.params.id
  );

  if (!profile)
    return res.status(404).send("Student profile not found.");

  res.send(profile);
});

module.exports = router;