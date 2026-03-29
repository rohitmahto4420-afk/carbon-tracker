const express = require("express");
const router = express.Router();
const MonthlySummary = require("../models/MonthlySummary");

// GET monthly summary for a specific user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query; // optional filters

    let query = { userId };
    if (month && year) {
      query.month = Number(month);
      query.year = Number(year);
    }
    
    // Sort by latest if no specific month/year
    const summaries = await MonthlySummary.find(query).sort({ year: -1, month: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// UPSERT (Create or Update) monthly summary
router.post("/", async (req, res) => {
  try {
    const { userId, month, year, total_emission, previous_month_emission, target } = req.body;

    if (!userId || !month || !year) {
      return res.status(400).json({ message: "Missing required fields: userId, month, year" });
    }

    const updatedSummary = await MonthlySummary.findOneAndUpdate(
      { userId, month, year },
      { 
        $set: { 
          // Only update fields if they are provided, or set to 0/target if undefined
          ...(total_emission !== undefined && { total_emission }),
          ...(previous_month_emission !== undefined && { previous_month_emission }),
          ...(target !== undefined && { target })
        } 
      },
      { new: true, upsert: true }
    );

    res.json(updatedSummary);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
