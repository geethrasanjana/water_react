import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_URL = "https://d02ysh37xd.execute-api.us-east-1.amazonaws.com/items";

export default function WaterManagementDashboard() {
  const [waterData, setWaterData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Hardcoded values
  const tankReceiverGateStatus = "ON"; // Change to "OFF" to test different states
  const waterFlowRate = 3.5; // Liters per second
  const gateOpenLevel = 65; // Percentage

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setWaterData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getFormattedDate = () => {
    return currentTime.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning 🌅";
    else if (hour >= 12 && hour < 17) return "Good Afternoon ☀️";
    else return "Good Evening 🌙";
  };

  function Navbar() {
    return (
      <nav className="navbar">
        <div className="greeting">{getGreeting()}</div>
        <div className="date-time">
          <span className="date">{getFormattedDate()}</span>
          <span className="time">{getFormattedTime()}</span>
        </div>
      </nav>
    );
  }

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1 className="dashboard-title">💧 Water Management Dashboard</h1>

        <button className="navigate-button" onClick={() => navigate("/previous-data")}>
          📊 View Previous Data
        </button>

        {waterData.length > 0 ? (
          <div className="dashboard-grid">
            {/* Water Tank Level */}
            <div className="card">
              <h2>Water Tank Level</h2>
              <CircularProgressbar
                value={waterData[0].waterLevel}
                text={`${waterData[0].waterLevel}%`}
                styles={buildStyles({
                  textSize: "20px",
                  pathColor: "#00ff00",
                  textColor: "#00ff00",
                  trailColor: "#333",
                })}
              />
            </div>

            {/* Temperature */}
            <div className="card">
              <h2>Temperature</h2>
              <p className="digital-meter">{waterData[0].temperature}°C</p>
            </div>

            {/* Humidity */}
            <div className="card">
              <h2>Humidity</h2>
              <p className="digital-meter">{waterData[0].humidity}%</p>
            </div>

            {/* Tank Receiver Water Gate */}
            <div className={`card gate-card ${tankReceiverGateStatus === "ON" ? "gate-on" : "gate-off"}`}>
              <h2>Tank Receiver Gate</h2>
              <p>{tankReceiverGateStatus}</p>
            </div>

            {/* Water Flow Rate */}
            <div className="card flow-card">
              <h2>Water Flow Rate</h2>
              <p className="flow-rate">{waterFlowRate} L/s</p>
            </div>

            {/* Gate Open Level */}
            <div className="card gate-open-card">
              <h2>Gate Open Level</h2>
              <p className="gate-level">{gateOpenLevel}%</p>
            </div>

            {/* Temperature Chart */}
            <div className="chart-card">
              <h2>Temperature Levels</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} tick={{ fill: "#fff" }} />
                  <YAxis tick={{ fill: "#fff" }} />
                  <Tooltip wrapperStyle={{ backgroundColor: "#222", color: "#fff" }} />
                  <Line type="monotone" dataKey="temperature" stroke="#ff9900" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Humidity Chart */}
            <div className="chart-card">
              <h2>Humidity Levels</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                  <XAxis dataKey="timestamp" tickFormatter={(time) => new Date(time).toLocaleTimeString()} tick={{ fill: "#fff" }} />
                  <YAxis tick={{ fill: "#fff" }} />
                  <Tooltip wrapperStyle={{ backgroundColor: "#222", color: "#fff" }} />
                  <Line type="monotone" dataKey="humidity" stroke="#00ffcc" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <p className="loading-text">Loading data...</p>
        )}
      </div>
    </>
  );
}
