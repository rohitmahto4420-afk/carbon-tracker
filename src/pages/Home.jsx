import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Zap, Utensils, ShoppingBag, Wind } from "lucide-react";
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [quickEntry, setQuickEntry] = useState({ category: 'transport', value: '' });

  const [data, setData] = useState({
    recentTotal: 1.24,
    previousMonth: 1.42,
    target: 1.10,
    improvement: 12.4,
    travelValue: 42,
    homeValue: 31,
    foodValue: 27,
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const url = userId
          ? `https://carbon-tracker-d2d8.onrender.com/api/carbon/${userId}`
          : "https://carbon-tracker-d2d8.onrender.com/api/carbon";
  
        const res = await fetch(url);
        if (res.ok) {
          const records = await res.json();
          if (!Array.isArray(records) || records.length === 0) return;
          
          const latest = records[records.length - 1];
          const previous = records.length > 1 ? records[records.length - 2] : null;
          
          // Assuming data is in kg, convert to tons for the UI if it's large, but let's keep the number relative.
          // If the mock is 1.24 tons = 1240 kg. 
          const currentTotal = (latest.totalCO2 || latest.total || 0) / 1000;
          if(currentTotal === 0) return; // Keep mock if 0

          const prevTotal = previous ? (previous.totalCO2 || previous.total || 0) / 1000 : currentTotal * 1.12;
          
          let imp = 0;
          if (prevTotal > 0) {
            imp = ((prevTotal - currentTotal) / prevTotal) * 100;
          }
          
          const totalCat = (latest.transportCO2 || 0) + (latest.homeEnergyCO2 || 0) + (latest.meatCO2 || 0) || 1;

          setData({
            recentTotal: currentTotal.toFixed(2),
            previousMonth: prevTotal.toFixed(2),
            target: Math.max(0.5, (prevTotal * 0.9)).toFixed(2),
            improvement: imp.toFixed(1),
            travelValue: Math.round(((latest.transportCO2 || 0) / totalCat) * 100) || 42,
            homeValue: Math.round(((latest.homeEnergyCO2 || 0) / totalCat) * 100) || 31,
            foodValue: Math.round(((latest.meatCO2 || 0) / totalCat) * 100) || 27,
          });

          if (userId) {
            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();
            fetch("https://carbon-tracker-d2d8.onrender.com/api/monthly-summary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                month: currentMonth,
                year: currentYear,
                total_emission: (latest.totalCO2 || latest.total || 0),
                previous_month_emission: previous ? (previous.totalCO2 || previous.total || 0) : 0,
              })
            }).catch(e => console.error("Sync error:", e));
          }
        }
      } catch (err) {
        console.error("Error fetching carbon records:", err);
      }
    };
    fetchRecords();
    window.addEventListener("carbonUpdated", fetchRecords);
    return () => window.removeEventListener("carbonUpdated", fetchRecords);
  }, []);

  const handleQuickSubmit = async () => {
    if (!quickEntry.value) return;
    const val = Number(quickEntry.value);
    
    // Convert to CO2 impact
    let impact = 0;
    if (quickEntry.category === 'transport') impact = val * 0.21;
    if (quickEntry.category === 'homeEnergy') impact = val * 0.82;
    if (quickEntry.category === 'meatMeals') impact = val * 3.3;

    const newRecord = {
      userId: localStorage.getItem("userId") || null,
      date: new Date().toLocaleString(),
      transport: quickEntry.category === 'transport' ? val : 0,
      electricity: quickEntry.category === 'homeEnergy' ? val : 0,
      meatMeals: quickEntry.category === 'meatMeals' ? val : 0,
      
      transportCO2: quickEntry.category === 'transport' ? impact : 0,
      electricityCO2: quickEntry.category === 'homeEnergy' ? impact : 0,
      homeEnergyCO2: quickEntry.category === 'homeEnergy' ? impact : 0,
      meatCO2: quickEntry.category === 'meatMeals' ? impact : 0,
      
      totalCO2: impact,
      total: impact
    };

    try {
      await fetch("https://carbon-tracker-d2d8.onrender.com/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      });
      window.dispatchEvent(new Event('carbonUpdated'));
      setQuickEntry({ ...quickEntry, value: '' });
      alert("Quick Entry logged successfully!");
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Section */}
      <div className="dashboard-top-section">
        <div className="dashboard-hero-text">
          <span className="badge-light">CARBON FOOTPRINT</span>
          <div className="hero-metric">
            <h1>{data.recentTotal}</h1>
            <span className="unit">tonsCO2e</span>
          </div>
          <p className="hero-description">
            Your monthly impact is down by <strong>{data.improvement}%</strong> compared to the previous cycle. You're currently on track for your lowest quarter ever.
          </p>
        </div>
        
        <div className="dashboard-mini-cards">
          <div className="mini-card">
            <span className="mini-card-label">PREVIOUS MONTH</span>
            <span className="mini-card-value">{data.previousMonth}t</span>
          </div>
          <div className="mini-card">
            <span className="mini-card-label">TARGET</span>
            <span className="mini-card-value">{data.target}t</span>
          </div>
        </div>
      </div>

      {/* Quick Entry Section */}
      <div className="quick-entry-card">
        <h3>Quick Log <Zap size={18} style={{verticalAlign: 'middle', marginLeft: '5px', color:'var(--brand-green)'}}/></h3>
        <div className="quick-entry-form">
          <select 
            value={quickEntry.category} 
            onChange={(e) => setQuickEntry({...quickEntry, category: e.target.value})}
          >
            <option value="transport">Transport (km)</option>
            <option value="homeEnergy">Home Energy (kWh)</option>
            <option value="meatMeals">Food (Meat Meals)</option>
          </select>
          <input 
            type="number" 
            placeholder="Enter value" 
            value={quickEntry.value}
            onChange={(e) => setQuickEntry({...quickEntry, value: e.target.value})}
          />
          <button className="btn-quick-log" onClick={handleQuickSubmit}>Log Entry &rarr;</button>
        </div>
      </div>

      {/* Category Section */}
      <div className="dashboard-categories">
        {/* Travel */}
        <div className="category-card" onClick={() => navigate('/graph')}>
          <div className="cat-header">
            <div className="cat-icon-wrapper"><Car size={20} /></div>
            <span className="cat-percentage">{data.travelValue}% OF TOTAL</span>
          </div>
          <h3>Travel</h3>
          <p>Commutes and flights recorded this period.</p>
          <div className="cat-progress-box">
            <div className="cat-progress-labels">
              <span>GOAL PROGRESS</span>
              <span>65%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '65%'}}></div></div>
          </div>
        </div>

        {/* Home Energy */}
        <div className="category-card" onClick={() => navigate('/graph')}>
          <div className="cat-header">
            <div className="cat-icon-wrapper"><Zap size={20} /></div>
            <span className="cat-percentage">{data.homeValue}% OF TOTAL</span>
          </div>
          <h3>Home Energy</h3>
          <p>Electricity, heating, and cooling usage.</p>
          <div className="cat-progress-box">
            <div className="cat-progress-labels">
              <span>GOAL PROGRESS</span>
              <span>82%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '82%'}}></div></div>
          </div>
        </div>

        {/* Food */}
        <div className="category-card" onClick={() => navigate('/graph')}>
          <div className="cat-header">
            <div className="cat-icon-wrapper"><Utensils size={20} /></div>
            <span className="cat-percentage">{data.foodValue}% OF TOTAL</span>
          </div>
          <h3>Food & Diet</h3>
          <p>Dietary choices and local sourcing data.</p>
          <div className="cat-progress-box">
            <div className="cat-progress-labels">
              <span>GOAL PROGRESS</span>
              <span>38%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{width: '38%'}}></div></div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom-section">
        <div className="recent-activities">
          <div className="section-header">
            <h2>Recent Activities</h2>
            <Link to="/records" className="view-link">VIEW RECORDS</Link>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon"><Car size={16} /></div>
              <div className="activity-details">
                <h4>Commute to Office</h4>
                <span>24km • Diesel Vehicle</span>
              </div>
              <div className="activity-impact pos">+5.4kg<br/><small>TODAY, 09:12</small></div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><ShoppingBag size={16} /></div>
              <div className="activity-details">
                <h4>Farmers Market Grocery</h4>
                <span>Local & Seasonal items</span>
              </div>
              <div className="activity-impact neg">-2.1kg<br/><small>YESTERDAY</small></div>
            </div>
            <div className="activity-item">
              <div className="activity-icon"><Wind size={16} /></div>
              <div className="activity-details">
                <h4>Laundry Cycle</h4>
                <span>Eco-mode • Air dried</span>
              </div>
              <div className="activity-impact pos">+0.8kg<br/><small>OCT 24, 16:30</small></div>
            </div>
          </div>
        </div>

        <div className="cta-card">
          <div className="cta-content">
            <h2>Join the Forest<br/>Restoration<br/>Program</h2>
            <p>Offset your remaining {data.recentTotal} tons by contributing to our reforestation project in the Pacific Northwest.</p>
            <button className="cta-btn" onClick={() => window.open('https://www.nature.org/en-us/about-us/where-we-work/united-states/washington/', '_blank')}>LEARN MORE</button>
          </div>
        </div>
      </div>
    </div>
  );
}