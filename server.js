if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const pool = require('./db');
const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const {
  checkApiKey,
  serverErrorMessage,
  userNotFoundMessage,
} = require("./vars");

const app = express();

app.use(cors());
app.use(express.json());

const title = "What the heck are you doing down Here? go to the Front-End!";

app.get("/", (req, res) => {
  res.send(title);
});

app.post("/login", checkApiKey, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email != null && password != null) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await (
        await pool.query("SELECT * FROM users WHERE email=$1;", [email])
      ).rows[0];

      if (user != null) {
        if (await bcrypt.compare(password, user.password)) {
          return res.json(user);
        } else {
          return res.status(400).json({ message: "Wrong Password" });
        }
      } else {
        return res.status(400).json({ message: "There is no User with that Email" });
      }
    } else {
      res
        .status(400)
        .json({
          message: "You have to supply an email and a password to login",
        });
    }
  } catch (err) {
    res.status(500).json({ message: serverErrorMessage });
    return console.error(err.message);
  }
});

app.use("/users", usersRouter);
app.use("/posts", postsRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
