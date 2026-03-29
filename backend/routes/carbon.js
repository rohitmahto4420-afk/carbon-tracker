const router = require("express").Router();

const CarbonData = require("../models/CarbonData");

router.post("/", async (req, res) => {

  try {

    const data = new CarbonData(req.body);

    await data.save();

    res.json(data);

  } catch (err) {

    res.status(500).json(err);

  }

});

router.get("/:userId", async (req, res) => {

  try {

    const data = await CarbonData.find({ userId: req.params.userId });

    res.json(data);

  } catch (err) {

    res.status(500).json(err);

  }

});

router.get("/", async (req, res) => {
  try {
    const data = await CarbonData.find();
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await CarbonData.findByIdAndDelete(req.params.id);
    res.json("Record has been deleted.");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/simulate", async (req, res) => {
  try {
    const { daily_emission, improvement_level, duration } = req.body;
    
    // Check missing params
    if (daily_emission === undefined || improvement_level === undefined || duration === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const future_emission = daily_emission * duration;
    const reduced_emission = future_emission - (future_emission * (improvement_level / 100));
    const saved = future_emission - reduced_emission;

    res.json({
      current: Number(future_emission.toFixed(2)),
      improved: Number(reduced_emission.toFixed(2)),
      saved: Number(saved.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ message: "Simulation failed", error: err });
  }
});

module.exports = router;