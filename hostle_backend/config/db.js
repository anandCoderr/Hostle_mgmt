import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("MongoDB is already connected.");
      return;
    }

    await mongoose.connect("mongodb://127.0.0.1:27017/hostlemgmt");
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message || error}`);
    process.exit(1); // Exit process with failure
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB reconnected");
});

export default connectDb;
