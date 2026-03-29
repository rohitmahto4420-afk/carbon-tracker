import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import html2pdf from "html2pdf.js";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const CarbonCalculator = () => {
  // ---------------- INPUT STATES ----------------
  const [transport, setTransport] = useState("");
  const [electricity, setElectricity] = useState("");
  const [lpg, setLpg] = useState("");

  // NEW INPUTS
  const [flights, setFlights] = useState("");
  const [waste, setWaste] = useState("");
  const [meatMeals, setMeatMeals] = useState("");

  // ---------------- RESULT STATES ----------------
  const [transportCO2, setTransportCO2] = useState(0);
  const [electricityCO2, setElectricityCO2] = useState(0);
  const [lpgCO2, setLpgCO2] = useState(0);
  const [homeEnergyCO2, setHomeEnergyCO2] = useState(0);

  // NEW OUTPUTS
  const [flightsCO2, setFlightsCO2] = useState(0);
  const [wasteCO2, setWasteCO2] = useState(0);
  const [meatCO2, setMeatCO2] = useState(0);

  const [totalCO2, setTotalCO2] = useState(0);

  // ---------------- SAVED RECORDS ----------------
  const [records, setRecords] = useState([]);

  // ---------------- CHART DATA ----------------
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total CO₂ (kg)",
        data: [],
        borderWidth: 2,
        tension: 0.4,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
      },
    ],
  });

  // ---------------- CALCULATE ----------------
  const calculateCarbon = () => {
    // Basic coefficients (kg CO2)
    const transportValue = Number(transport) * 0.21;
    const electricityValue = Number(electricity) * 0.82;
    const lpgValue = Number(lpg) * 2.98;

    // New coefficients 
    // Flights: ~90kg per hour of flight
    // Waste: ~1.2kg per kg of waste
    // Meat: ~3.3kg per meat-based meal
    const flightsValue = Number(flights) * 90;
    const wasteValue = Number(waste) * 1.2;
    const meatValue = Number(meatMeals) * 3.3;

    const homeEnergy = electricityValue + lpgValue;
    const total = transportValue + homeEnergy + flightsValue + wasteValue + meatValue;

    setTransportCO2(transportValue.toFixed(2));
    setElectricityCO2(electricityValue.toFixed(2));
    setLpgCO2(lpgValue.toFixed(2));
    setHomeEnergyCO2(homeEnergy.toFixed(2));

    setFlightsCO2(flightsValue.toFixed(2));
    setWasteCO2(wasteValue.toFixed(2));
    setMeatCO2(meatValue.toFixed(2));

    setTotalCO2(total.toFixed(2));

    // ---- SAVE RECORD TO DB ----
    const newRecord = {
      userId: localStorage.getItem("userId") || null,
      date: new Date().toLocaleString(),
      transport: Number(transport),
      electricity: Number(electricity),
      lpg: Number(lpg),
      flights: Number(flights),
      waste: Number(waste),
      meatMeals: Number(meatMeals),

      transportCO2: transportValue,
      electricityCO2: electricityValue,
      lpgCO2: lpgValue,
      flightsCO2: flightsValue,
      wasteCO2: wasteValue,
      meatCO2: meatValue,

      homeEnergyCO2: homeEnergy,
      totalCO2: total,
      total: total.toFixed(2)
    };

    fetch("https://carbon-tracker-d2d8.onrender.com/api/carbon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord)
    })
      .then(res => res.json())
      .then(savedData => {
        // use the savedData directly
        const updatedRecords = [...records, { ...savedData, total: total.toFixed(2) }];
        setRecords(updatedRecords);
        // Dispatch event for Dashboard to fetch newly added data
        window.dispatchEvent(new Event('carbonUpdated'));
        // Scroll to dashboard
        const dashboardEl = document.getElementById("dashboard");
        if (dashboardEl) {
          dashboardEl.scrollIntoView({ behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      })
      .catch(err => console.error(err));
  };

  // ---------------- LOAD SAVED DATA FROM DB ----------------
  // ---------------- LOAD SAVED DATA FROM DB ----------------
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const url = userId
          ? `https://carbon-tracker-d2d8.onrender.com/api/carbon/${userId}`
          : "https://carbon-tracker-d2d8.onrender.com/api/carbon";

        const res = await fetch(url);
        if (res.ok) {
          let saved = await res.json();

          saved = saved.map(r => ({
            ...r,
            total: r.totalCO2 != null
              ? r.totalCO2.toFixed(2)
              : (r.total || '0')
          }));

          setRecords(saved);

          setChartData({
            labels: saved.length === 1
              ? ["Start", saved[0].date?.split(',')[0] || "No Date"]
              : saved.map((r) => r.date?.split(',')[0] || "No Date"),
            datasets: [
              {
                label: "Total CO₂ (kg)",
                data: saved.length === 1
                  ? [0, saved[0].total]
                  : saved.map((r) => r.total),
                borderWidth: 2,
                tension: 0.4,
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.2)",
              },
            ],
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecords();
  }, []);

  // ---------------- AUTO UPDATE GRAPH ----------------
  useEffect(() => {
    if (records.length > 0) {
      setChartData({
        labels: records.length === 1 ? ["Start", records[0].date ? records[0].date.split(',')[0] : 'No Date'] : records.map((r) => r.date ? r.date.split(',')[0] : 'No Date'),
        datasets: [
          {
            label: "Total CO₂ (kg)",
            data: records.length === 1 ? [0, records[0].total] : records.map((r) => r.total),
            borderWidth: 2,
            tension: 0.4,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.2)",
          },
        ],
      });
    }
  }, [records]);

  // ---------------- INSIGHTS ----------------
  const getInsight = () => {
    if (totalCO2 > 100) return "⚠️ Your carbon footprint is HIGH.";
    if (totalCO2 > 50) return "⚠️ Your carbon footprint is MODERATE.";
    return "✅ Your carbon footprint is LOW.";
  };

  const getTotalColor = () => {
    if (totalCO2 > 100) return "#ef4444";
    if (totalCO2 > 50) return "#f59e0b";
    return "#10b981";
  };

  const getTip = () => {
    // Dynamic tips based on highest emitter
    const categories = [
      { name: "Transport", value: Number(transportCO2), tip: "🚗 Tip: Try carpooling, using public transit, or cycling to reduce your transport footprint." },
      { name: "Electricity", value: Number(electricityCO2), tip: "💡 Tip: Switch to LED bulbs and unplug devices when not in use." },
      { name: "LPG", value: Number(lpgCO2), tip: "🔥 Tip: Cover your pots while cooking to use LPG more efficiently." },
      { name: "Flights", value: Number(flightsCO2), tip: "✈️ Tip: Look for direct flights or consider rail travel for shorter distances." },
      { name: "Waste", value: Number(wasteCO2), tip: "♻️ Tip: Start composting kitchen waste and maximize your recycling." },
      { name: "Diet", value: Number(meatCO2), tip: "🥩 Tip: Incorporate 1-2 plant-based meals a week to dramatically cut your diet footprint." }
    ];

    // Find the max
    let maxCat = categories[0];
    for (let c of categories) {
      if (c.value > maxCat.value) {
        maxCat = c;
      }
    }

    if (maxCat.value === 0) return "Fill out the fields to get personalized tips!";
    return maxCat.tip;
  };

  // ---------------- DOWNLOAD PDF ----------------
  const downloadPDF = () => {
    const element = document.getElementById("pdf-content");
    const opt = {
      margin: 0.5,
      filename: 'Carbon_Calculation_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: '.pdf-block-avoid' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // ---------------- DELETE SAVED RECORD ----------------
  // ---------------- DELETE SAVED RECORD ----------------
  const deleteRecord = async (id) => {
    try {
      const res = await fetch(
        `https://carbon-tracker-d2d8.onrender.com/api/carbon/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        const updatedRecords = records.filter((r) => r._id !== id);
        setRecords(updatedRecords);

        window.dispatchEvent(new Event('carbonUpdated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="calculator-box" style={{ maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Carbon Footprint Calculator</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px 20px" }}>

        {/* Transportation */}
        <h4 style={{ gridColumn: "1 / -1", margin: "0", marginTop: "10px" }}>Transportation</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Car/Bike Travel (km)</label>
          <input
            type="number"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            placeholder="Enter distance in km"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Flights (Hours)</label>
          <input
            type="number"
            value={flights}
            onChange={(e) => setFlights(e.target.value)}
            placeholder="Enter flight hours"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Home Energy */}
        <h4 style={{ gridColumn: "1 / -1", margin: "0", marginTop: "10px" }}>Home Energy</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Electricity Used (kWh)</label>
          <input
            type="number"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
            placeholder="Enter electricity usage"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>LPG Used</label>
          <input
            type="number"
            value={lpg}
            onChange={(e) => setLpg(e.target.value)}
            placeholder="Enter LPG usage"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

        {/* Lifestyle */}
        <h4 style={{ gridColumn: "1 / -1", margin: "0", marginTop: "10px" }}>Lifestyle</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Waste Generated (kg/week)</label>
          <input
            type="number"
            value={waste}
            onChange={(e) => setWaste(e.target.value)}
            placeholder="Enter waste in kg"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label>Meat-based Meals (per week)</label>
          <input
            type="number"
            value={meatMeals}
            onChange={(e) => setMeatMeals(e.target.value)}
            placeholder="Enter meat meals count"
            style={{ width: "100%", boxSizing: "border-box" }}
          />
        </div>

      </div>

      <button onClick={calculateCarbon} style={{ marginTop: "15px", width: "100%", padding: "10px", background: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
        Calculate
      </button>

      {(Number(totalCO2) > 0 || records.length > 0) && (
        <div style={{ marginTop: "30px" }}>
          <div id="pdf-content">
            {Number(totalCO2) > 0 && (
              <div className="pdf-block-avoid" style={{ padding: "20px", background: "var(--card-bg, #fff)", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
                <h3 style={{ textAlign: "center", marginBottom: "20px", marginTop: 0 }}>Your Carbon Report</h3>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>🚗 Transportation:</span> <strong>{transportCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>✈️ Flights:</span> <strong>{flightsCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>⚡ Electricity:</span> <strong>{electricityCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>🔥 LPG:</span> <strong>{lpgCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>♻️ Waste:</span> <strong>{wasteCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
                  <span>🥩 Meat/Diet:</span> <strong>{meatCO2} kg CO₂</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--input-border)", paddingBottom: "10px", marginBottom: "20px" }}>
                  <span>🏠 <b>Home Energy:</b></span> <strong><b>{homeEnergyCO2} kg CO₂</b></strong>
                </div>

                <h3 style={{ textAlign: "center", fontSize: "24px", color: getTotalColor(), marginBottom: "20px" }}>Total: {totalCO2} kg CO₂</h3>

                <div style={{ background: "var(--input-bg, #f3f4f6)", padding: "15px", borderRadius: "8px", border: "1px solid var(--input-border)" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>📊 Insights</h4>
                  <p style={{ margin: "0 0 5px 0" }}>{getInsight()}</p>
                  <p style={{ margin: 0 }}>{getTip()}</p>
                </div>
              </div>
            )}

            {records.length > 0 && (
              <div className="pdf-block-avoid" style={{ padding: "20px", background: "var(--card-bg, #fff)", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
                <h3 style={{ textAlign: "center" }}>📈 Carbon Footprint Trend</h3>
                <div style={{ padding: "10px" }}>
                  <Line data={chartData} options={{
                    animation: false,
                    scales: {
                      x: { ticks: { color: "var(--text-color)" }, grid: { color: "rgba(156, 163, 175, 0.2)" } },
                      y: { ticks: { color: "var(--text-color)" }, grid: { color: "rgba(156, 163, 175, 0.2)" } }
                    },
                    plugins: { legend: { labels: { color: "var(--text-color)" } } }
                  }} />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={downloadPDF}
            style={{
              marginTop: "15px",
              width: "100%",
              padding: "12px",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px"
            }}
          >
            📄 Save Calculation as PDF
          </button>
        </div>
      )}

      <hr />

      <h3>💾 Saved Records</h3>
      {records.length === 0 ? (
        <p>No records saved yet.</p>
      ) : (
        records.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <p style={{ margin: 0 }}>
              {r.date} → {r.total} kg CO₂
            </p>
            <button
              onClick={() => deleteRecord(r._id)}
              style={{ padding: "5px 10px", background: "#ff4d4f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default CarbonCalculator;