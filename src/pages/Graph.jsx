import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Lightbulb, Utensils, Bike } from "lucide-react";
import './Graph.css';

const COLORS = ["#002B20", "#B4E3C9", "#A6D2BB", "#7E8C82", "#EAE6D6"];

export default function Graph() {
  const [data, setData] = useState({
    recentTransport: 40,
    recentHome: 20,
    recentMeat: 30,
    historyFull: [],
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const url = userId ? `https://carbon-tracker-d2d8.onrender.com/api/carbon/${userId}` : "https://carbon-tracker-d2d8.onrender.com/api/carbon";
        const res = await fetch(url);
        if (res.ok) {
          const records = await res.json();
          if (!Array.isArray(records) || records.length === 0) return;
          
          const latest = records[records.length - 1];
          const last6 = records.slice(-6);
          
          setData({
            recentTransport: latest.transportCO2 || 0,
            recentHome: latest.homeEnergyCO2 || 0,
            recentMeat: latest.meatCO2 || 0,
            // also combine waste/flights if needed, but the mockup only shows 3 categories in the legend
            historyFull: last6.map((r) => {
              const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
              const dateObj = r.date ? new Date(r.date) : new Date();
              const val = (r.totalCO2 || r.total || 0) / 1000; // in tons
              return {
                month: months[dateObj.getMonth()],
                You: Number(val.toFixed(2)),
                "Global Avg": Number((val * 1.2).toFixed(2)) // mock global average
              };
            }),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecords();
  }, []);

  const pieData = [
    { name: "Transport", value: data.recentTransport },
    { name: "Diet", value: data.recentMeat },
    { name: "Energy", value: data.recentHome },
  ].filter(item => item.value > 0).sort((a,b) => b.value - a.value);

  const totalVal = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const displayVal = totalVal > 0 ? (totalVal / 1000).toFixed(2) : "1.20";

  // Provide realistic mock data if fewer than 2 records
  const displayHistory = data.historyFull.length > 2 ? data.historyFull : [
    { month: "JAN", You: 1.1, "Global Avg": 1.6 },
    { month: "FEB", You: 1.2, "Global Avg": 1.6 },
    { month: "MAR", You: 1.3, "Global Avg": 1.6 },
    { month: "APR", You: 1.4, "Global Avg": 1.5 },
    { month: "MAY", You: 1.5, "Global Avg": 1.5 },
    { month: "JUN", You: 1.24, "Global Avg": 1.5 },
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <span className="badge-light">INSIGHTS ENGINE</span>
        <h1>Carbon Analytics</h1>
        <p>A deep dive into your ecological footprint. Track, compare, and understand the impact of your daily choices on the global ecosystem.</p>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-card impact-card">
          <div className="chart-header">
            <div>
              <h3>Impact Over Time</h3>
              <p>Carbon footprint (tCO2e) over the last 6 months</p>
            </div>
            <div className="chart-legend-custom">
              <span className="legend-item"><span className="dot dot-you"></span>You</span>
              <span className="legend-item"><span className="dot dot-global"></span>Global Avg</span>
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6D6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#7E8C82' }} dy={10} />
                <YAxis hide={true} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  itemStyle={{ fontWeight: 600, color: 'var(--text-color)' }}
                />
                <Area type="monotone" dataKey="Global Avg" stroke="#7E8C82" strokeWidth={2} strokeDasharray="5 5" fill="none" activeDot={false} />
                <Area type="monotone" dataKey="You" stroke="#002B20" strokeWidth={3} fillOpacity={0.1} fill="#B4E3C9" activeDot={{ r: 6, strokeWidth: 0, fill: '#002B20' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card mix-card">
          <div className="chart-header">
            <h3>Footprint Mix</h3>
            <p>Breakdown by activity type</p>
          </div>
          <div className="donut-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{name: 'Mock', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {pieData.length === 0 && <Cell fill="#EAE6D6" />}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `${Number(value).toFixed(1)}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                  itemStyle={{ color: 'var(--text-color)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-text">
              <span className="donut-value">{displayVal}</span>
              <span className="donut-label">METRIC TONS</span>
            </div>
          </div>
          <div className="custom-pie-legend">
            {pieData.map((entry, index) => (
              <div className="pie-legend-item" key={entry.name}>
                <div className="plegend-left">
                  <span className="plegend-dot" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                  {entry.name}
                </div>
                <div className="plegend-right">
                  {Math.round((entry.value / pieData.reduce((a, b) => a + (b.value || 0), 0)) * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tips-section-header">
        <div>
          <h2>Personalized Tips</h2>
          <p>Tailored actions based on your current carbon mix.</p>
        </div>
        <a href="#" className="view-all-link">View all 12 recommendations</a>
      </div>

      <div className="tips-grid">
        <div className="tip-card">
          <div className="tip-icon"><Lightbulb size={20}/></div>
          <h3>Switch to LEDs</h3>
          <p>Reduce your energy usage by up to 15% by replacing older incandescent bulbs with smart LED alternatives.</p>
          <button className="learn-more-btn" onClick={() => window.open('https://www.energy.gov/energysaver/led-lighting', '_blank')}>Learn More →</button>
        </div>
        
        <div className="tip-card">
          <div className="tip-icon"><Utensils size={20}/></div>
          <h3>Meat-Free Monday</h3>
          <p>Cutting out meat just one day a week can reduce your personal diet footprint by 14% annually.</p>
          <button className="learn-more-btn" onClick={() => window.open('https://www.meatfreemondays.com/', '_blank')}>Learn More →</button>
        </div>

        <div className="tip-card">
          <div className="tip-icon"><Bike size={20}/></div>
          <h3>Eco-Commuting</h3>
          <p>Swap a 5-mile car trip for a bike ride once a week to save nearly 120kg of CO2 per year.</p>
          <button className="learn-more-btn" onClick={() => window.open('https://www.epa.gov/transportation-air-pollution-and-climate-change', '_blank')}>Learn More →</button>
        </div>
      </div>

      <div className="analytics-banner">
        <div className="banner-content">
          <h2>Small shifts in daily habits grow into global regeneration.</h2>
          <p>Our data shows that 84% of our community has reduced their footprint in the last quarter.</p>
        </div>
      </div>
    </div>
  );
}