if (process.env.NODE_ENV !== "production") require("dotenv").config();

const usersRouter = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

const {
  checkApiKey,
  serverErrorMessage,
  invalidApiKeyMessage,
  userNotFoundMessage
} = require("../vars");

let currentUser = null;

const userCreatedSuccessfulyMessage = "The User is created successfuly";
const userEditedMessage = "The User is Edited Successfuly";
const userDeletedMessage = "The User is Deleted";

const getUserById = async (req, res, next) => {
  const selectedUserId = req.params.id;
  try {
    if (selectedUserId != null) {
      let user = await (
        await pool.query("SELECT * FROM users WHERE id=$1;", [selectedUserId])
      ).rows[0];
      currentUser = user;

      if (user == null) {
        return res.status(404).json({ message: userNotFoundMessage });
      }

      return next();
    }
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
};

const editUser = async (data, columnName) => {
  if (data != null) {
    await pool.query(`UPDATE users SET ${columnName}=$1 WHERE id=$2`, [
      data,
      currentUser.id,
    ]);
  }
};

usersRouter.get("/", checkApiKey, async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users;");
    return res.json(allUsers.rows);
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
});

usersRouter.get("/:id", getUserById, (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      return res.json(currentUser);
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

usersRouter.post("/", checkApiKey, async (req, res) => {
  try {
    const { name, email, password, user_image_url, description } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, user_image_url, description) VALUES ($1, $2, $3, $4, $5);",
      [name, email, hashedPassword, user_image_url, description]
    );

    return res.status(201).json({ message: userCreatedSuccessfulyMessage });
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
});

usersRouter.patch("/:id", getUserById, async (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      const { name, email, password, user_image_url, description } = req.body;

      if (name != null) {
        editUser(name, "name");
      }

      if (email != null) {
        editUser(email, "email");
      }

      if (password != null) {
        hashedPassword = await bcrypt.hash(password, 10);
        editUser(hashedPassword, "password");
      }

      if (user_image_url != null) {
        editUser(user_image_url, "user_image_url");
      }

      if (description != null) {
        editUser(description, "description");
      }

      return res.json({ message: userEditedMessage });
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

usersRouter.delete("/:id", getUserById, async (req, res) => {
  if (req.headers.authorization === process.env.API_KEY) {
    try {
      await pool.query("DELETE FROM users WHERE id=$1", [currentUser.id]);
      return res.json({ message: userDeletedMessage });
    } catch (err) {
      res.status(500).json({ message: serverErrorMessage });
      return console.error(err.message);
    }
  } else {
    return res.status(401).json({ message: invalidApiKeyMessage });
  }
});

module.exports = usersRouter;
