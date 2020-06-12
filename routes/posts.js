if (process.env.NODE_ENV !== "production") require("dotenv").config();

const postsRouter = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

const {
  checkApiKey,
  serverErrorMessage,
  invalidApiKeyMessage,
} = require("../vars");

let currentPost = null;

const postNotFoundMessage = "The Post is not found";
const postCreatedSuccessfulyMessage = "The Post is created successfuly";
const postEditedMessage = "The Post is Edited Successfuly";
const postDeletedMessage = "The Post is Deleted";

const getPostById = async (req, res, next) => {
  const selectedPostId = req.params.id;
  try {
    if (selectedPostId != null) {
      let post = await (
        await pool.query("SELECT * FROM posts WHERE id=$1;", [selectedPostId])
      ).rows[0];
      currentPost = post;

      if (post == null) {
        return res.status(404).json({ message: postNotFoundMessage });
      }

      return next();
    }
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
};

const editPost = async (data, columnName) => {
  if (data != null) {
    await pool.query(`UPDATE posts SET ${columnName}=$1 WHERE id=$2`, [
      data,
      currentPost.id,
    ]);
  }
};

postsRouter.get("/", checkApiKey, async (req, res) => {
  try {
    const allPosts = await pool.query("SELECT * FROM posts;");
    return res.json(allPosts.rows);
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
});

postsRouter.get("/:id", getPostById, (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      return res.json(currentPost);
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

postsRouter.post("/", checkApiKey, async (req, res) => {
  try {
    const { userId, postText } = req.body;

    await pool.query(
      "INSERT INTO posts (userid, post_text) VALUES ($1, $2);",
      [userId, postText]
    );

    return res.status(201).json({ message: postCreatedSuccessfulyMessage });
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
});

postsRouter.patch("/:id", getPostById, async (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      const postText = req.body.postText;

      if (postText != null) {
        editPost(postText, "post_text");
      }

      return res.json({ message: postEditedMessage });
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

postsRouter.delete("/:id", getPostById, async (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      await pool.query("DELETE FROM posts WHERE id=$1", [currentPost.id]);
      return res.json({ message: postDeletedMessage });
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

module.exports = postsRouter;
