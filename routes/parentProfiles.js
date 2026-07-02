const express = require("express");
const router = express.Router();

const {
  ParentProfile,
  validate,
} = require("../models/parentProfile");

const { User } = require("../models/user");

// GET ALL PARENT PROFILES
router.get("/", async (req, res) => {
  const profiles = await ParentProfile.find()
    .populate("user", "name email role")
    .populate("students", "name email role")
    .sort("-createdAt");

  res.send(profiles);
});

// GET SINGLE PARENT PROFILE
router.get("/:id", async (req, res) => {
  const profile = await ParentProfile.findById(req.params.id)
    .populate("user", "name email role")
    .populate("students", "name email role");

  if (!profile) {
    return res.status(404).send("Parent profile not found.");
  }

  res.send(profile);
});

// CREATE PARENT PROFILE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.body.user);
  if (!user) return res.status(400).send("Invalid parent user.");

  if (user.role !== "parent") {
    return res.status(400).send("User must have role parent.");
  }

  let profile = await ParentProfile.findOne({ user: req.body.user });
  if (profile) return res.status(400).send("Parent profile already exists.");

  profile = new ParentProfile({
    user: req.body.user,
    phone: req.body.phone,
    address: req.body.address,
    occupation: req.body.occupation,
    students: req.body.students,
    is_active: req.body.is_active,
  });

  await profile.save();

  res.send(profile);
});

// UPDATE PARENT PROFILE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const profile = await ParentProfile.findByIdAndUpdate(
    req.params.id,
    {
      user: req.body.user,
      phone: req.body.phone,
      address: req.body.address,
      occupation: req.body.occupation,
      students: req.body.students,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!profile) {
    return res.status(404).send("Parent profile not found.");
  }

  res.send(profile);
});

// DELETE PARENT PROFILE
router.delete("/:id", async (req, res) => {
  const profile = await ParentProfile.findByIdAndDelete(req.params.id);

  if (!profile) {
    return res.status(404).send("Parent profile not found.");
  }

  res.send(profile);
});

module.exports = router;