import React, { useState } from 'react';
import UploadBox from '../components/UploadBox';
import ResultCard from '../components/ResultCard';
import { Camera, FileText, CheckCircle, XCircle } from 'lucide-react';
import './SmartScanner.css';

export default function SmartScanner() {
  const [activeTab, setActiveTab] = useState('bill'); // 'bill' or 'food'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Results structures
  const [scanResult, setScanResult] = useState(null);
  
  // Hybrid Food Analyzer State
  const [foodPrompt, setFoodPrompt] = useState(null);
  const [pendingFoodMatch, setPendingFoodMatch] = useState(null);

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setScanResult(null);
    setFoodPrompt(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    const endpoint = activeTab === 'bill' ? '/api/scanner/bill' : '/api/scanner/food';
    const apiUrl = `http://localhost:5000${endpoint}`; // You can swap to production URL if deployed

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error scanning image');
      }

      if (activeTab === 'bill') {
        setScanResult(data.data);
      } else {
        // Food Analyzer: Wait for confirmation
        setFoodPrompt(data.data.prompt);
        setPendingFoodMatch(data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to scanner API. Ensure local backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmFood = async () => {
    // Treat as 1 quantity of the detected item and calculate
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/scanner/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ name: pendingFoodMatch.detected, quantity: 1 }] })
      });
      const data = await response.json();
      if (response.ok) {
        setScanResult(data.data);
        setFoodPrompt(null);
      }
    } catch (err) {
      setError("Failed to calculate carbon.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecalculate = async () => {
    if (!scanResult || !scanResult.detectedItems) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/scanner/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: scanResult.detectedItems })
      });
      const data = await response.json();
      if (response.ok) {
        setScanResult(data.data);
      }
    } catch (err) {
      setError("Failed to recalculate.");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback from ResultCard when user edits quantity
  const handleEditItems = (updatedItems) => {
    setScanResult(prev => ({
      ...prev,
      detectedItems: updatedItems
    }));
  };

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <span className="badge-light">AI VISION LAB</span>
        <h1>Smart Carbon Scanner</h1>
        <p>Instantly estimate the footprint of your groceries or meals using intelligent OCR and Image Analysis.</p>
      </div>

      <div className="scanner-tabs">
        <button 
          className={`tab-btn ${activeTab === 'bill' ? 'active' : ''}`}
          onClick={() => { setActiveTab('bill'); setFile(null); setPreview(null); setScanResult(null); setFoodPrompt(null); }}
        >
          <FileText size={18} /> Receipt Scanner
        </button>
        <button 
          className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
          onClick={() => { setActiveTab('food'); setFile(null); setPreview(null); setScanResult(null); setFoodPrompt(null); }}
        >
          <Camera size={18} /> Food Analyzer
        </button>
      </div>

      <div className="scanner-content">
        <div className="upload-section">
          {!preview ? (
            <UploadBox 
              title={activeTab === 'bill' ? "Upload Grocery Receipt" : "Upload Food Photo"} 
              description="Drag and drop an image here, or click to browse."
              onFileSelected={handleFileSelected} 
            />
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Upload preview" className="image-preview" />
              <div className="preview-actions">
                <button className="secondary-btn" onClick={() => { setFile(null); setPreview(null); setScanResult(null); setFoodPrompt(null); }}>Change Image</button>
                <button className="primary-btn" onClick={handleScan} disabled={isLoading}>
                  {isLoading ? "Scanning..." : "Analyze Impact"}
                </button>
              </div>
            </div>
          )}
          
          {error && <div className="error-message">{error}</div>}

          {foodPrompt && activeTab === 'food' && !scanResult && (
            <div className="food-confirmation">
              <div className="prompt-bubble">{foodPrompt}</div>
              <div className="confirm-actions">
                <button className="success-btn" onClick={handleConfirmFood}><CheckCircle size={18}/> Yes</button>
                <button className="danger-btn" onClick={() => setFoodPrompt(null)}><XCircle size={18}/> Change</button>
              </div>
            </div>
          )}
        </div>

        <div className="results-section">
          {scanResult ? (
            <ResultCard 
              results={scanResult} 
              isEditing={activeTab === 'bill'} 
              onEditItems={handleEditItems}
              onRecalculate={handleRecalculate}
            />
          ) : (
            <div className="empty-results">
              <div className="icon-wrap-large">
                {activeTab === 'bill' ? <FileText size={48}/> : <Camera size={48}/>}
              </div>
              <h3>Waiting for Image</h3>
              <p>Upload a {activeTab === 'bill' ? 'receipt' : 'food image'} to see the calculated carbon footprint breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
