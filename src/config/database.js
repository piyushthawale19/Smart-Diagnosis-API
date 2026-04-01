const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(env.mongodbUri, {
    maxPoolSize: 10,
  });

  return mongoose.connection;
};

module.exports = connectDatabase;
