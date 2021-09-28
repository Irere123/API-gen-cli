import { Router } from "express";

import { Post } from "../entity/Post";
import { isEmpty } from "../utils/isEmpty";

const router = Router();

router.get("/posts", async (_req, res) => {
  const posts = await Post.find();

  return res.json(posts).status(200);
});

router.get("/post/:id", async (req, res) => {
  const post = await Post.findOne(req.params.id);

  if (!post) {
    return res.json({ message: "That post is not found" }).status(404);
  }

  return res.json(post);
});

router.post("/post", async (req, res) => {
  const { body } = req.body;

  if (isEmpty(body)) {
    return res.json({
      success: false,
      field: "body",
      message: "You must provide the body",
    });
  }

  try {
    const post = await Post.create({
      body,
    }).save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default router;
