import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Leaf, AlertTriangle, Lightbulb } from 'lucide-react';

const COLORS = ["#10B981", "#E11D48", "#F59E0B", "#3B82F6", "#8B5CF6"];

export default function ResultCard({ results, isEditing, onEditItems, onRecalculate }) {
  if (!results) return null;

  const { totalCarbon, detectedItems, categoryBreakdown, highestImpact, suggestion } = results;

  const pieData = Object.keys(categoryBreakdown || {}).map(cat => ({
    name: cat,
    value: categoryBreakdown[cat]
  }));

  const handleQuantityChange = (index, newQty) => {
    const updated = [...detectedItems];
    updated[index].quantity = Math.max(0, parseInt(newQty) || 0);
    onEditItems(updated);
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <h2>Total CO₂ Footprint</h2>
        <div className="big-carbon-number">{totalCarbon} <span>kg</span></div>
      </div>

      <div className="result-charts">
        <div className="chart-wrapper-mini" style={{height: '200px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => `${Number(value).toFixed(2)} kg`}
                  contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}
                />
              </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="high-impact-alert">
          {highestImpact && (
            <>
               <div style={{display: 'flex', alignItems: 'center', gap: '10px', color: '#E11D48', fontWeight: 600, marginBottom: '5px'}}>
                   <AlertTriangle size={18} /> Highest Impact
               </div>
               <div style={{fontSize: '20px', fontWeight: 700}}>{highestImpact.name.toUpperCase()}</div>
               <div style={{fontSize: '14px', color: 'var(--text-muted)'}}>{highestImpact.totalCarbon.toFixed(1)} kg CO₂ ({Math.round(highestImpact.totalCarbon / totalCarbon * 100)}%)</div>
            </>
          )}
        </div>
      </div>

      <div className="smart-suggestion">
         <Lightbulb size={20} color="#F59E0B" style={{flexShrink: 0}} />
         <p>{suggestion}</p>
      </div>

      <div className="items-list-container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h3>Detected Items</h3>
            {isEditing && <button className="recalc-btn" onClick={onRecalculate}>Recalculate</button>}
        </div>
        
        {detectedItems && detectedItems.length > 0 ? (
          <ul className="detected-items">
            {detectedItems.map((item, idx) => (
              <li key={item.id || idx}>
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-category badge">{item.category}</span>
                </div>
                <div className="item-controls">
                  {isEditing ? (
                    <input 
                      type="number" 
                      className="qty-input" 
                      value={item.quantity} 
                      onChange={(e) => handleQuantityChange(idx, e.target.value)}
                      min="0"
                    />
                  ) : (
                    <span className="item-qty">x{item.quantity}</span>
                  )}
                  <span className="item-carbon">{item.totalCarbon.toFixed(1)} kg</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
           <p style={{color: 'var(--text-muted)'}}>No specific raw items detected.</p>
        )}
      </div>
    </div>
  );
}
