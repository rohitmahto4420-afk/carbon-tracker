import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TreePine, Zap, Car, Leaf } from "lucide-react";
import "./Simulator.css";

export default function Simulator() {
  const [durationDays, setDurationDays] = useState(30);
  const [improvementLevel, setImprovementLevel] = useState(15);
  const [dailyEmission, setDailyEmission] = useState(10); // Base value 10kg/day
  const [simResults, setSimResults] = useState({ current: 0, improved: 0, saved: 0 });
  const [chartData, setChartData] = useState([]);

  // Fetch actual user daily emission average
  useEffect(() => {
    const fetchUserAvg = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;
        const url = `https://carbon-tracker-d2d8.onrender.com/api/carbon/${userId}`;
        const res = await fetch(url);
        if (res.ok) {
          const records = await res.json();
          if (records.length > 0) {
            // Find avg over recent records, fallback to mock if very low
            const total = records.reduce((acc, r) => acc + (r.totalCO2 || r.total || 0), 0);
            const avgDaily = (total / records.length);
            if (avgDaily > 0) {
              setDailyEmission(avgDaily);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user avg", err);
      }
    };
    fetchUserAvg();
  }, []);

  // Run Simulation Calculation whenever controls change
  useEffect(() => {
    // Making it robust to work even if the backend is not yet deployed or is offline.
    // First, try the API
    const runSimulation = async () => {
      try {
        const res = await fetch("https://carbon-tracker-d2d8.onrender.com/api/carbon/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daily_emission: dailyEmission, improvement_level: improvementLevel, duration: durationDays })
        });
        
        if (res.ok) {
          const data = await res.json();
          setSimResults(data);
          generateChart(data.current, data.improved);
          return;
        }
      } catch (err) {
        console.log("Remote API failed, falling back to local computation");
      }

      // Fallback local logic in case the new updated backend is not deployed to standard render URL yet.
      const future_emission = dailyEmission * durationDays;
      const reduced_emission = future_emission * (1 - improvementLevel / 100);
      const saved = future_emission - reduced_emission;
      
      setSimResults({
        current: future_emission,
        improved: reduced_emission,
        saved: saved
      });

      generateChart(future_emission, reduced_emission);
    };

    runSimulation();
  }, [dailyEmission, improvementLevel, durationDays]);

  const generateChart = (totalCurrent, totalImproved) => {
    const dataPoints = [];
    const steps = 6;
    const stepDays = durationDays / steps;
    
    // Starting point is day 0
    dataPoints.push({ time: "Now", CurrentStyle: 0, ImprovedStyle: 0 });

    for (let i = 1; i <= steps; i++) {
        let label = `Day ${Math.floor(i * stepDays)}`;
        if (durationDays === 365) label = `Month ${Math.floor(i * 2)}`;
        if (durationDays === 180) label = `Month ${Math.floor(i * 1)}`;

        dataPoints.push({
            time: label,
            CurrentStyle: Number((totalCurrent / steps) * i).toFixed(2),
            ImprovedStyle: Number((totalImproved / steps) * i).toFixed(2)
        });
    }

    setChartData(dataPoints);
  };

  const handleTimeSelect = (days) => setDurationDays(days);

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <span className="badge-light">CARBON TIME MACHINE</span>
        <h1>Future Impact Simulator</h1>
        <p>Predict your future carbon footprint by adjusting your habits today. See the compound effect of small behavioral changes over time.</p>
      </div>

      <div className="controls-section">
        <div className="control-group">
          <div className="control-label">Time Horizon <span>{durationDays} Days</span></div>
          <div className="time-btn-group">
            <button className={`time-btn ${durationDays === 30 ? 'active' : ''}`} onClick={() => handleTimeSelect(30)}>1 Month</button>
            <button className={`time-btn ${durationDays === 180 ? 'active' : ''}`} onClick={() => handleTimeSelect(180)}>6 Months</button>
            <button className={`time-btn ${durationDays === 365 ? 'active' : ''}`} onClick={() => handleTimeSelect(365)}>1 Year</button>
          </div>
        </div>

        <div className="control-group">
          <div className="control-label">Improvement Commitment <span>{improvementLevel}%</span></div>
          <input 
            type="range" 
            className="range-slider" 
            min="0" 
            max="50" 
            value={improvementLevel} 
            onChange={(e) => setImprovementLevel(Number(e.target.value))} 
          />
          <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)'}}>
            <span>0% (Same Habits)</span>
            <span>50% (Eco-Warrior)</span>
          </div>
        </div>
      </div>

      <div className="simulator-charts-grid">
        <div className="chart-card impact-card">
          <div className="chart-header" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <div>
              <h3>Cumulative Emissions</h3>
              <p>Projected kgCO2 over selected period</p>
            </div>
            <div className="chart-legend-custom">
              <span className="legend-item"><span className="dot" style={{background: '#E11D48'}}></span>Current Route</span>
              <span className="legend-item"><span className="dot" style={{background: '#10B981'}}></span>Improved Route</span>
            </div>
          </div>
          
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--input-border)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis hide={true} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                    itemStyle={{ fontWeight: 600, color: 'var(--text-color)' }}
                  />
                  <Area type="monotone" dataKey="CurrentStyle" name="Current Route" stroke="#E11D48" strokeWidth={3} strokeDasharray="5 5" fill="none" activeDot={false} />
                  <Area type="monotone" dataKey="ImprovedStyle" name="Improved Route" stroke="#10B981" strokeWidth={3} fillOpacity={0.1} fill="#B4E3C9" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stats-card">
            <div className="stat-item">
              <label>Projected If Unchanged</label>
              <span className="value">{Number(simResults.current).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
            </div>
            <div className="stat-item">
              <label>Projected With Effort</label>
              <span className="value">{Number(simResults.improved).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
            </div>
            <div style={{height: '1px', background: 'rgba(255,255,255,0.2)'}}></div>
            <div className="stat-item">
              <label style={{color: '#fff'}}>Total Saved CO2</label>
              <span className="value saved">-{Number(simResults.saved).toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
            </div>
        </div>
      </div>

      <div className="tips-section-header">
        <div>
          <h2>Real World Equivalents</h2>
          <p>What does {Number(simResults.saved).toLocaleString(undefined, { maximumFractionDigits: 0 })}kg of saved CO2 actually mean?</p>
        </div>
      </div>

      <div className="real-world-grid">
        <div className="equivalent-card">
            <div className="icon-wrap"><TreePine size={24}/></div>
            <h4>~{Math.max(1, Math.round(simResults.saved / 21))}</h4>
            <p>Trees breathing for a whole year</p>
        </div>
        <div className="equivalent-card">
            <div className="icon-wrap"><Car size={24}/></div>
            <h4>{Math.round(simResults.saved * 4)} km</h4>
            <p>Avoided in driving a gas-powered car</p>
        </div>
        <div className="equivalent-card">
            <div className="icon-wrap"><Zap size={24}/></div>
            <h4>{Math.round(simResults.saved * 2.3)} kWh</h4>
            <p>Enough electricity to power a home for days</p>
        </div>
      </div>

      <div className="tips-section-header" style={{marginTop: '40px'}}>
        <div>
          <h2>AI Smart Suggestions</h2>
          <p>Based on your selected {improvementLevel}% improved route.</p>
        </div>
      </div>

      <div className="real-world-grid">
        <div className="equivalent-card" style={{alignItems: 'flex-start', textAlign: 'left'}}>
            <h4 style={{fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18}/> Switch to Public Transit</h4>
            <p>For a {improvementLevel}% reduction, swapping just 2 daily car trips for a train ride drastically cuts emissions.</p>
        </div>
        <div className="equivalent-card" style={{alignItems: 'flex-start', textAlign: 'left'}}>
            <h4 style={{fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}><Leaf size={18}/> Plant-Based Days</h4>
            <p>Try 3 meat-free days a week to comfortably hit your {improvementLevel}% overall improvement goal.</p>
        </div>
        <div className="equivalent-card" style={{alignItems: 'flex-start', textAlign: 'left'}}>
            <h4 style={{fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18}/> Energy Efficiency</h4>
            <p>Reduce AC usage by 2 hours daily and switch to smart LEDs to save up to 15% on your electricity footprint.</p>
        </div>
      </div>
      
    </div>
  );
}
