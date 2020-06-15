if (process.env.NODE_ENV !== "production") require("dotenv").config();

const express = require("express");
const cors = require("cors");

console.log("process.env", process.env);

const usersRouter = require("./routes/users");
const postsRouter = require("./routes/posts");

const app = express();

app.use(cors());
app.use(express.json());

const title = "What the heck are you doing down Here? go to the Front-End!";

app.get("/", (req, res) => {
  res.send(title);
});

app.use("/users", usersRouter);
app.use("/posts", postsRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
