const fs = require('fs');
const path = require('path');

const itemsDataPath = path.join(__dirname, '../data/items.json');
let itemsDb = {};
try {
  itemsDb = JSON.parse(fs.readFileSync(itemsDataPath, 'utf8'));
} catch (err) {
  console.error("Could not load items.json", err);
}

function calculateBillCarbon(ocrText) {
  const words = ocrText.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  
  const detectedItems = [];
  let totalCarbon = 0;
  
  const foundItemsMap = {};

  words.forEach(word => {
    if (itemsDb[word]) {
      if (!foundItemsMap[word]) {
        foundItemsMap[word] = {
          name: word,
          category: itemsDb[word].category,
          carbon: itemsDb[word].carbon,
          quantity: 1
        };
      } else {
        foundItemsMap[word].quantity += 1;
      }
    }
  });

  const categoryBreakdown = {};
  
  Object.values(foundItemsMap).forEach(item => {
    const itemTotal = item.carbon * item.quantity;
    detectedItems.push({
      id: Math.random().toString(36).substring(7),
      name: item.name,
      category: item.category,
      carbon: item.carbon,
      quantity: item.quantity,
      totalCarbon: itemTotal
    });
    totalCarbon += itemTotal;

    if (!categoryBreakdown[item.category]) categoryBreakdown[item.category] = 0;
    categoryBreakdown[item.category] += itemTotal;
  });

  detectedItems.sort((a, b) => b.totalCarbon - a.totalCarbon);

  const highestImpact = detectedItems.length > 0 ? detectedItems[0] : null;

  return {
    totalCarbon: Number(totalCarbon.toFixed(2)),
    detectedItems,
    categoryBreakdown,
    highestImpact
  };
}

module.exports = { calculateBillCarbon, itemsDb };
