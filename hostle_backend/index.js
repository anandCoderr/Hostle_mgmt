import { serverVar } from "./common/static/serverStatic";
import connectDb from "./config/db";
import express from "express";
import 'dotenv/config'


const app = express();

app.use(express.json());

connectDb();

// ----------------------Port code where it will listen
app.listen(serverVar.port_num, () => {
  console.log(`server is running on port number ${serverVar.port_num}`);
});
