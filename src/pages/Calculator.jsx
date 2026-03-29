import React, { useState, useEffect } from "react";
import { ArrowLeft, Car, Plane, Zap, Utensils, Trash2, CheckCircle } from "lucide-react";
import './Calculator.css';

export default function Calculator() {
  const [step, setStep] = useState(1); // 1: Category, 2: Details, 3: Review
  const [activeCategory, setActiveCategory] = useState(null);
  const [energySource, setEnergySource] = useState('grid');
  
  // Maintain all variables needed by backend
  const [formData, setFormData] = useState({
    transport: "",
    flights: "",
    electricity: "",
    lpg: "",
    waste: "",
    meatMeals: ""
  });
  
  const [calculationResult, setCalculationResult] = useState(null);

  useEffect(() => {
    const handleReset = () => {
      setStep(1);
      setActiveCategory(null);
      setFormData({
        transport: "",
        flights: "",
        electricity: "",
        lpg: "",
        waste: "",
        meatMeals: ""
      });
      setCalculationResult(null);
    };
    window.addEventListener('resetCalculator', handleReset);
    return () => window.removeEventListener('resetCalculator', handleReset);
  }, []);

  const categories = [
    { id: 'transport', title: 'Commute', desc: 'Track your daily travels via car, bus, train, or bike.', icon: <Car size={24}/> },
    { id: 'flights', title: 'Flight', desc: 'Log air travel distances and cabin class impacts.', icon: <Plane size={24}/> },
    { id: 'electricity', title: 'Electricity', desc: 'Energy consumption in kWh for home or office.', icon: <Zap size={24}/> },
    { id: 'meatMeals', title: 'Diet', desc: 'Impact of high-carbon food choices like red meat.', icon: <Utensils size={24}/> },
    { id: 'waste', title: 'Waste', desc: 'Recycling and landfill output monitoring.', icon: <Trash2 size={24}/> },
  ];

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const calculateImpactPreview = () => {
    // Backend standard coeffs
    const transportValue = Number(formData.transport || 0) * 0.21;
    const flightsValue = Number(formData.flights || 0) * 90;
    const electricityValue = Number(formData.electricity || 0) * 0.82;
    const lpgValue = Number(formData.lpg || 0) * 2.98;
    const wasteValue = Number(formData.waste || 0) * 1.2;
    const meatValue = Number(formData.meatMeals || 0) * 3.3;

    const total = transportValue + electricityValue + lpgValue + flightsValue + wasteValue + meatValue;
    setCalculationResult({
      total: total.toFixed(2),
      details: { transportValue, flightsValue, electricityValue, lpgValue, wasteValue, meatValue }
    });
    setStep(3);
  };

  const handleSubmit = async () => {
    if(!calculationResult) return;
    const { details, total } = calculationResult;
    const homeEnergy = details.electricityValue + details.lpgValue;

    const newRecord = {
      userId: localStorage.getItem("userId") || null,
      date: new Date().toLocaleString(),
      transport: Number(formData.transport || 0),
      electricity: Number(formData.electricity || 0),
      lpg: Number(formData.lpg || 0),
      flights: Number(formData.flights || 0),
      waste: Number(formData.waste || 0),
      meatMeals: Number(formData.meatMeals || 0),

      transportCO2: details.transportValue,
      electricityCO2: details.electricityValue,
      lpgCO2: details.lpgValue,
      flightsCO2: details.flightsValue,
      wasteCO2: details.wasteValue,
      meatCO2: details.meatValue,

      homeEnergyCO2: homeEnergy,
      totalCO2: Number(total),
      total: total
    };

    try {
      await fetch("https://carbon-tracker-d2d8.onrender.com/api/carbon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      });
      window.dispatchEvent(new Event('carbonUpdated'));
      
      // Reset
      setFormData({ transport: "", flights: "", electricity: "", lpg: "", waste: "", meatMeals: "" });
      alert("Impact recorded successfully!");
      setStep(1);
      setActiveCategory(null);
    } catch(e) {
      console.error(e);
      alert("Failed to record. See console.");
    }
  };

  const activeCatData = categories.find(c => c.id === activeCategory);

  return (
    <div className="log-activity-container">
      {/* Header */}
      <div className="log-header">
        <h1>Trace your <span className="highlight-text">impact.</span></h1>
        <p>Select an activity category below to record your environmental footprint for the day. Every data point contributes to the Living Canvas ecosystem.</p>
      </div>

      {/* Stepper */}
      <div className="stepper-wrap">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-num">1</div> Category
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-num">2</div> Details
        </div>
        <div className="step-line"></div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-num"><CheckCircle size={14}/></div> Review
        </div>
      </div>

      {/* STEP 1: Categories */}
      {step === 1 && (
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="cat-select-card" onClick={() => handleCategoryClick(cat.id)}>
              <div className="cat-icon-lg">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.desc}</p>
              <div className="arrow-icon">→</div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: Details */}
      {step === 2 && activeCatData && (
        <div className="details-form-card">
          <div className="form-header">
            <button className="back-btn" onClick={() => setStep(1)}><ArrowLeft size={20}/></button>
            <div>
              <span className="small-label">ACTIVITY DETAILS</span>
              <h2>{activeCatData.title} Usage</h2>
            </div>
          </div>

          <div className="form-body">
            {activeCategory === 'electricity' && (
              <>
                <div className="input-group">
                  <label>Energy Consumed (kWh)</label>
                  <input type="number" placeholder="0.00" value={formData.electricity} onChange={(e) => handleInputChange('electricity', e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Energy Source</label>
                  <div className="source-buttons">
                    <button className={`source-btn ${energySource === 'grid' ? 'active' : ''}`} onClick={() => setEnergySource('grid')}>Main Grid</button>
                    <button className={`source-btn ${energySource === 'solar' ? 'active' : ''}`} onClick={() => setEnergySource('solar')}>Solar PV</button>
                    <button className={`source-btn ${energySource === 'wind' ? 'active' : ''}`} onClick={() => setEnergySource('wind')}>Wind/Green Tariff</button>
                  </div>
                </div>
              </>
            )}
            
            {activeCategory === 'transport' && (
              <div className="input-group">
                <label>Distance Travelled (km)</label>
                <input type="number" placeholder="0" value={formData.transport} onChange={(e) => handleInputChange('transport', e.target.value)} />
              </div>
            )}

            {activeCategory === 'flights' && (
              <div className="input-group">
                <label>Flight Duration (Hours)</label>
                <input type="number" placeholder="0" value={formData.flights} onChange={(e) => handleInputChange('flights', e.target.value)} />
              </div>
            )}

            {activeCategory === 'meatMeals' && (
              <div className="input-group">
                <label>Meat-based Meals</label>
                <input type="number" placeholder="0" value={formData.meatMeals} onChange={(e) => handleInputChange('meatMeals', e.target.value)} />
              </div>
            )}

            {activeCategory === 'waste' && (
              <div className="input-group">
                <label>Waste Generated (kg)</label>
                <input type="number" placeholder="0" value={formData.waste} onChange={(e) => handleInputChange('waste', e.target.value)} />
              </div>
            )}
          </div>

          <div className="form-footer">
            <button className="save-later-btn" onClick={() => setStep(1)}>Save for Later</button>
            <button className="calculate-btn" onClick={calculateImpactPreview}>Calculate Impact</button>
          </div>
        </div>
      )}

      {/* STEP 3: Review */}
      {step === 3 && calculationResult && (
        <div className="details-form-card">
          <div className="form-header">
            <button className="back-btn" onClick={() => setStep(2)}><ArrowLeft size={20}/></button>
            <div>
              <span className="small-label">REVIEW & CONFIRM</span>
              <h2>Impact Calculation Ready</h2>
            </div>
          </div>

          <div className="review-body" style={{padding: '30px', textAlign: 'center'}}>
            <h1 style={{fontSize: '48px', color: 'var(--brand-green)', margin: '0 0 10px 0'}}>{calculationResult.total} <small style={{fontSize: '20px', color: 'var(--text-muted)'}}>kg CO₂e</small></h1>
            <p style={{color: 'var(--text-muted)'}}>This entry will be added to your permanent ecological record.</p>
          </div>

          <div className="form-footer">
            <button className="save-later-btn" onClick={() => setStep(2)}>Cancel</button>
            <button className="calculate-btn" onClick={handleSubmit}>Save to Ecosystem</button>
          </div>
        </div>
      )}

      {/* Quote section */}
      {step === 1 && (
        <div className="quote-box">
          <p>"The greatest threat to our planet is the belief that someone else will save it."</p>
          <span>— ROBERT SWAN</span>
        </div>
      )}
    </div>
  );
}