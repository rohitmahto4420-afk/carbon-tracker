require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const carbonRoutes = require("./routes/carbon");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://jhaankush47_db_user:ankush123@ac-swslrtj-shard-00-00.wihifmz.mongodb.net:27017,ac-swslrtj-shard-00-01.wihifmz.mongodb.net:27017,ac-swslrtj-shard-00-02.wihifmz.mongodb.net:27017/?ssl=true&replicaSet=atlas-g0zg49-shard-0&authSource=admin&appName=ClusterTest")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/carbon", carbonRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

