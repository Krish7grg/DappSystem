require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const campaignRoutes = require("./routes/campaignRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ DB error:", err));

app.get("/", (_req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/campaigns", campaignRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/activities", activityRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});