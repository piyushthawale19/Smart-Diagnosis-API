const app = require("./src/app");
const connectDatabase = require("./src/config/database");
const env = require("./src/config/env");

const start = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Smart Diagnosis API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
