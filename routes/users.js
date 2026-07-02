const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

const auth = require('../middleware/auth');
const { User, validate } = require("../models/user");
const schoolHead = require("../middleware/schoolHead");

// REGISTER USER
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .send({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
});

// GET THE CURRENT USER
router.get('/me', [auth,schoolHead], async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});

// GET ALL USERS
router.get("/", async (req, res) => {
  const users = await User.find().select("-password").sort("name");
  res.send(users);
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) return res.status(404).send("User with the given ID was not found.");

  res.send(user);
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  const { error } = validate({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password || "default123",
    role: req.body.role,
  });

  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    },
    { new: true }
  ).select("-password");

  if (!user) return res.status(404).send("User with the given ID was not found.");

  res.send(user);
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id).select("-password");

  if (!user) return res.status(404).send("User with the given ID was not found.");

  res.send(user);
});

module.exports = router;