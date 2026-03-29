const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractTextFromImage } = require('../utils/ocr');
const { calculateBillCarbon, itemsDb } = require('../utils/carbonCalc');

// Receive image into memory buffer
const upload = multer({ storage: multer.memoryStorage() });

// 🧾 POST /api/scanner/bill
router.post('/bill', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });
    
    // OCR Extraction
    const text = await extractTextFromImage(req.file.buffer);
    
    // Calculate carbon logic based on detected keywords
    const results = calculateBillCarbon(text);
    
    // Generate suggestion based on highest impact item
    let suggestion = "Great job logging your receipt!";
    if (results.highestImpact && results.highestImpact.category === "meat") {
      suggestion = `Your highest impact item is ${results.highestImpact.name}. Try reducing meat for a 30% lower footprint!`;
    } else if (results.highestImpact) {
        suggestion = `${results.highestImpact.name} carries the most carbon. Consider eco-friendly alternatives.`;
    }

    res.json({
      success: true,
      data: {
        ...results,
        suggestion
      }
    });

  } catch (error) {
    console.error("Bill scan error:", error);
    res.status(500).json({ success: false, message: "Failed to scan receipt" });
  }
});

// 🍔 POST /api/scanner/food
// Hybrid mock: Simulates vision AI by reading the filename or randomly guessing if no keywords match.
router.post('/food', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    // Mock logic: Try to guess food from original filename, else default to "pizza" or "chicken"
    let detectedFoodStr = "pizza"; 
    const filename = req.file.originalname.toLowerCase();
    
    Object.keys(itemsDb).forEach(key => {
      if (filename.includes(key)) {
        detectedFoodStr = key;
      }
    });

    const itemCarbonRef = itemsDb[detectedFoodStr] || { category: "unknown", carbon: 0 };
    let promptMsg = `Yeh ${detectedFoodStr} lag raha hai 🍕`;
    if(itemCarbonRef.category === 'meat') promptMsg = `Yeh ${detectedFoodStr} lag raha hai 🍗`;
    if(itemCarbonRef.category === 'veg') promptMsg = `Yeh ${detectedFoodStr} lag raha hai 🥗`;

    // Provide the detection back to the user to "Confirm / Change"
    res.json({
      success: true,
      data: {
        detected: detectedFoodStr,
        confidence: 89,
        prompt: promptMsg,
        carbonDetails: itemCarbonRef
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Food analysis failed" });
  }
});

// Calculate updated totals when user edits auto-detected items manually
router.post('/calculate', (req, res) => {
  const { items } = req.body; // array of { name, quantity }
  if (!items || !Array.isArray(items)) return res.status(400).json({ message: "Invalid items array" });

  let totalCarbon = 0;
  const categoryBreakdown = {};
  const processedItems = [];

  items.forEach(item => {
    const dbItem = itemsDb[item.name.toLowerCase()] || { category: 'custom', carbon: 1 };
    const itemTotal = dbItem.carbon * (item.quantity || 1);
    
    totalCarbon += itemTotal;
    
    if (!categoryBreakdown[dbItem.category]) categoryBreakdown[dbItem.category] = 0;
    categoryBreakdown[dbItem.category] += itemTotal;

    processedItems.push({
      ...item,
      category: dbItem.category,
      carbonPerUnit: dbItem.carbon,
      totalCarbon: itemTotal
    });
  });

  processedItems.sort((a, b) => b.totalCarbon - a.totalCarbon);
  const highestImpact = processedItems.length > 0 ? processedItems[0] : null;
  
  let suggestion = "Awesome modifications!";
  if (highestImpact && highestImpact.category === "meat") {
      suggestion = `${highestImpact.name} drives up your carbon score. Meat reductions help significantly.`;
  }

  res.json({
    success: true,
    data: {
      totalCarbon: Number(totalCarbon.toFixed(2)),
      items: processedItems,
      categoryBreakdown,
      highestImpact,
      suggestion
    }
  });
});

module.exports = router;
