const express = require("express");
const router = express.Router();
const { Board, validateBoard } = require("../models/Board");

router.get("/", async (req, res) => {
  const boards = await Board.find().sort("name");
  res.send(boards);
});

router.get("/:id", async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) return res.status(404).send("Board not found.");

  res.send(board);
});

router.post("/", async (req, res) => {
  const { error } = validateBoard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const board = new Board(req.body);
  await board.save();

  res.status(201).send(board);
});

router.put("/:id", async (req, res) => {
  const { error } = validateBoard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const board = await Board.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!board) return res.status(404).send("Board not found.");

  res.send(board);
});

router.delete("/:id", async (req, res) => {
  const board = await Board.findByIdAndUpdate(
    req.params.id,
    { is_active: false },
    { new: true }
  );

  if (!board) return res.status(404).send("Board not found.");

  res.send(board);
});

module.exports = router;