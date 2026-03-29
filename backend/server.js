require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const carbonRoutes = require("./routes/carbon");
const scannerRoutes = require("./routes/scanner");
const monthlySummaryRoutes = require("./routes/monthlySummary");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use ENV variable here
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    console.log("Connected DB:", mongoose.connection.name); // ✅ FIXED
  })
  .catch((err) => console.log("Mongo Error ❌:", err));

app.use("/api/auth", authRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/monthly-summary", monthlySummaryRoutes);
console.log("Connected DB:", require("mongoose").connection.name);

// ✅ Use ENV PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});