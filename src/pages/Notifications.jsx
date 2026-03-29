import React from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowLeft, Trophy, Leaf, AlertCircle } from "lucide-react";

export default function Notifications() {
  const notifs = [
    { id: 1, type: 'achievement', title: 'Goal Reached!', desc: 'You stayed under your carbon target for the 3rd consecutive week!', time: '2 hours ago', icon: <Trophy size={20} color="#f59e0b" />, bg: 'rgba(245, 158, 11, 0.1)' },
    { id: 2, type: 'insight', title: 'New Insight Available', desc: 'Check out the new analytics on your home energy usage in Graph view.', time: 'Yesterday', icon: <Leaf size={20} color="#10b981" />, bg: 'rgba(16, 185, 129, 0.1)' },
    { id: 3, type: 'alert', title: 'High Travel Emissions Detected', desc: 'Your commute emissions were slightly higher than last week.', time: '3 days ago', icon: <AlertCircle size={20} color="#ef4444" />, bg: 'rgba(239, 68, 68, 0.1)' }
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", minHeight: "80vh" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link to="/home" style={{ color: 'var(--text-color)' }}><ArrowLeft size={24} /></Link>
        <h1 style={{ fontSize: "28px", margin: 0, fontWeight: 600 }}>Notifications</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {notifs.map(n => (
          <div key={n.id} style={{ display: 'flex', gap: '20px', padding: '20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--input-border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {n.icon}
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', color: 'var(--text-color)' }}>{n.title}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{n.desc}</p>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#D1D5DB' }}>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
