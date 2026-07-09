const express = require("express");
const router = express.Router();

const { Subscription, validate } = require("../models/subscription");

// GET ALL SUBSCRIPTIONS
router.get("/", async (req, res) => {
  const subscriptions = await Subscription.find().sort("-createdAt");
  res.send(subscriptions);
});

// GET ACTIVE SUBSCRIPTIONS
router.get("/active", async (req, res) => {
  const subscriptions = await Subscription.find({
    status: "ACTIVE",
  }).sort("-createdAt");

  res.send(subscriptions);
});

// GET SINGLE SUBSCRIPTION
router.get("/:id", async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    return res.status(404).send("Subscription not found.");
  }

  res.send(subscription);
});

// CREATE SUBSCRIPTION
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subscription = new Subscription({
    schoolName: req.body.schoolName,
    planName: req.body.planName,
    amount: req.body.amount,
    currency: req.body.currency,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    paymentStatus: req.body.paymentStatus,
    status: req.body.status,
  });

  await subscription.save();

  res.send(subscription);
});

// UPDATE SUBSCRIPTION
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subscription = await Subscription.findByIdAndUpdate(
    req.params.id,
    {
      schoolName: req.body.schoolName,
      planName: req.body.planName,
      amount: req.body.amount,
      currency: req.body.currency,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      paymentStatus: req.body.paymentStatus,
      status: req.body.status,
    },
    { new: true }
  );

  if (!subscription) {
    return res.status(404).send("Subscription not found.");
  }

  res.send(subscription);
});

// DELETE SUBSCRIPTION
router.delete("/:id", async (req, res) => {
  const subscription = await Subscription.findByIdAndDelete(req.params.id);

  if (!subscription) {
    return res.status(404).send("Subscription not found.");
  }

  res.send(subscription);
});

module.exports = router;