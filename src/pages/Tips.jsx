export default function Tips() {
  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "auto" }}>
      <h2 style={{ textAlign: "center", fontSize: "36px", color: "var(--text-color)", marginBottom: "10px" }}>
        🌍 Understanding Your Carbon Footprint
      </h2>
      <p style={{ textAlign: "center", color: "var(--text-color)", opacity: 0.8, fontSize: "18px", marginBottom: "40px" }}>
        Small steps can make a massive difference for our planet. Here is how it all works.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        {/* Card 1 */}
        <div style={cardStyle}>
          <div style={iconStyle}>🏭</div>
          <h3 style={titleStyle}>Main Sources</h3>
          <ul style={listStyle}>
            <li style={{ marginBottom: "8px" }}>⚡ <strong>Electricity:</strong> High consumption at home</li>
            <li style={{ marginBottom: "8px" }}>🚗 <strong>Transport:</strong> Cars, bikes, and public transit</li>
            <li style={{ marginBottom: "8px" }}>🍳 <strong>Cooking:</strong> LPG and natural gas usage</li>
            <li style={{ marginBottom: "8px" }}>🛍️ <strong>Lifestyle:</strong> Industrial & daily activities</li>
          </ul>
        </div>

        {/* Card 2 */}
        <div style={cardStyle}>
          <div style={iconStyle}>🌡️</div>
          <h3 style={titleStyle}>Why It Matters</h3>
          <p style={descStyle}>
            High carbon emissions are the primary driver of <strong>global warming</strong>, leading to severe climate change, melting glaciers, and extreme weather phenomena globally.
          </p>
        </div>

        {/* Card 3 */}
        <div style={cardStyle}>
          <div style={iconStyle}>🌱</div>
          <h3 style={titleStyle}>How To Reduce It</h3>
          <ul style={listStyle}>
            <li style={{ marginBottom: "8px" }}>☀️ <strong>Renewables:</strong> Switch to solar or wind energy</li>
            <li style={{ marginBottom: "8px" }}>💡 <strong>Efficiency:</strong> Turn off lights & use LED bulbs</li>
            <li style={{ marginBottom: "8px" }}>🚲 <strong>Mobility:</strong> Cycle, walk, or public transport</li>
            <li style={{ marginBottom: "8px" }}>♻️ <strong>Recycle:</strong> Reduce waste and reuse materials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "var(--card-bg)",
  borderRadius: "16px",
  padding: "30px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
  cursor: "default",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const iconStyle = {
  fontSize: "48px",
  marginBottom: "15px"
};

const titleStyle = {
  fontSize: "22px",
  color: "var(--text-color)",
  marginBottom: "15px",
  fontWeight: "600"
};

const descStyle = {
  color: "var(--text-color)",
  opacity: 0.9,
  fontSize: "16px",
  lineHeight: "1.6"
};

const listStyle = {
  listStyleType: "none",
  padding: 0,
  margin: 0,
  color: "var(--text-color)",
  opacity: 0.9,
  fontSize: "16px",
  lineHeight: "1.8",
  textAlign: "left",
  width: "100%"
};