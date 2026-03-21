const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      resolve();
    });

    server.on("error", (error) => {
      reject(error);
    });
  });
};

startServer().catch((error) => {
  console.error("Startup failure: unable to initialize server", error);
  process.exit(1);
});
