const express = require("express");
const router = express.Router();

const { Badge, validate } = require("../models/badge");

// GET ALL BADGES
router.get("/", async (req, res) => {
  const badges = await Badge.find().sort("name");
  res.send(badges);
});

// GET ACTIVE BADGES
router.get("/active", async (req, res) => {
  const badges = await Badge.find({ is_active: true }).sort("name");
  res.send(badges);
});

// GET SINGLE BADGE
router.get("/:id", async (req, res) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) return res.status(404).send("Badge not found.");

  res.send(badge);
});

// CREATE BADGE
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const badge = new Badge({
    name: req.body.name,
    description: req.body.description,
    badgeType: req.body.badgeType,
    iconUrl: req.body.iconUrl,
    is_active: req.body.is_active,
  });

  await badge.save();

  res.send(badge);
});

// UPDATE BADGE
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const badge = await Badge.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      badgeType: req.body.badgeType,
      iconUrl: req.body.iconUrl,
      is_active: req.body.is_active,
    },
    { new: true }
  );

  if (!badge) return res.status(404).send("Badge not found.");

  res.send(badge);
});

// DELETE BADGE
router.delete("/:id", async (req, res) => {
  const badge = await Badge.findByIdAndDelete(req.params.id);

  if (!badge) return res.status(404).send("Badge not found.");

  res.send(badge);
});

module.exports = router;