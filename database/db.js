import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const URL = process.env.ConnectionUrl;
const Connection = async () => {
  try {
    await mongoose.connect(URL, { useUnifiedTopology: true });
    console.log("Connected to database sucessfully...");
  } catch (err) {
    console.log("Error in connecting database is " + err);
  }
};

export default Connection;
