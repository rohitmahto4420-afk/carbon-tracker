import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";

export default function Search() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Mock search logic targeting records
    const fetchAndFilter = async () => {
      if(!query) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const url = userId ? `https://carbon-tracker-d2d8.onrender.com/api/carbon/${userId}` : "https://carbon-tracker-d2d8.onrender.com/api/carbon";
        const res = await fetch(url);
        if (res.ok) {
          const records = await res.json();
          // Filter generically for the mock search
          const filtered = records.filter(r => 
            (r.date && r.date.toLowerCase().includes(query.toLowerCase())) ||
            (r.totalCO2 && r.totalCO2.toString().includes(query)) ||
            (r.total && r.total.toString().includes(query))
          );
          setResults(filtered.reverse());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilter();
  }, [query]);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", minHeight: "80vh" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Link to="/home" style={{ color: 'var(--text-color)' }}><ArrowLeft size={24} /></Link>
        <h1 style={{ fontSize: "28px", margin: 0, fontWeight: 600 }}>Search Results</h1>
      </div>
      
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid var(--input-border)", marginBottom: "30px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
        <SearchIcon size={20} color="var(--text-muted)" />
        <span style={{ fontSize: "16px", color: "var(--text-muted)" }}>Showing results for "<strong style={{color: "var(--text-color)"}}>{query}</strong>"</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>Searching...</div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", background: "white", borderRadius: "12px", border: "1px dashed var(--input-border)" }}>
          No records found matching your query.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {results.map((r, i) => (
            <div key={i} style={{ padding: "20px", background: "white", borderRadius: "10px", border: "1px solid var(--input-border)", display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{r.date}</h3>
                <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Impact Record Entry</span>
              </div>
              <strong style={{ color: "var(--brand-green)", fontSize: "18px" }}>{r.totalCO2?.toFixed(2) || r.total} kg CO₂</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
