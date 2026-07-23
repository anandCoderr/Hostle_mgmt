import express from "express";
import connectDb from "./config/db.js";
import "dotenv/config";
import router from "./routes/index.js";

const app = express();

app.use(express.json());

app.use(router);

connectDb();

// ----------------------Port code where it will listen
const post_num = process.env.PORT_NUMBER;

app.listen(post_num, () => {
  console.log(`server is running on port number ${post_num}`);
});
