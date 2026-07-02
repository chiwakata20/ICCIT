const express = require("express");
const router = express.Router();
const { Resource, validateResource } = require("../models/Resource");
const { Subject } = require("../models/Subject");
const { SyllabusTopic } = require("../models/SyllabusTopic");

router.get("/", async (req, res) => {
  const filter = {};

  if (req.query.subject_id) filter.subject_id = req.query.subject_id;
  if (req.query.topic_id) filter.topic_id = req.query.topic_id;
  if (req.query.resource_type) filter.resource_type = req.query.resource_type;
  if (req.query.access_type) filter.access_type = req.query.access_type;
  if (req.query.approved) filter.approved = req.query.approved === "true";

  const resources = await Resource.find(filter)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title")
    .sort("-createdAt");

  res.send(resources);
});

router.get("/:id", async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate("subject_id", "name code level")
    .populate("topic_id", "title");

  if (!resource) return res.status(404).send("Resource not found.");

  resource.views += 1;
  await resource.save();

  res.send(resource);
});

router.post("/", async (req, res) => {
  const { error } = validateResource(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subject = await Subject.findById(req.body.subject_id);
  if (!subject) return res.status(400).send("Invalid subject_id.");

  if (req.body.topic_id) {
    const topic = await SyllabusTopic.findById(req.body.topic_id);
    if (!topic) return res.status(400).send("Invalid topic_id.");
  }

  const resource = new Resource(req.body);
  await resource.save();

  res.status(201).send(resource);
});

router.put("/:id", async (req, res) => {
  const { error } = validateResource(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!resource) return res.status(404).send("Resource not found.");

  res.send(resource);
});

router.patch("/:id/approve", async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  );

  if (!resource) return res.status(404).send("Resource not found.");

  res.send(resource);
});

router.delete("/:id", async (req, res) => {
  const resource = await Resource.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!resource) return res.status(404).send("Resource not found.");

  res.send(resource);
});

module.exports = router;