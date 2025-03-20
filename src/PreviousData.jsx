import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://d02ysh37xd.execute-api.us-east-1.amazonaws.com/items";

export default function PreviousData() {
  const [waterData, setWaterData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setWaterData(data.slice(-20)); // ✅ Show last 20 entries
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Previous Data 📊</h1>
      <button
        onClick={() => navigate("/")}
        className="mb-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        ⬅️ Back to Dashboard
      </button>

      <table className="w-full max-w-4xl bg-gray-800 text-white rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            <th className="py-2 px-4">Timestamp</th>
            <th className="py-2 px-4">Water Level (%)</th>
            <th className="py-2 px-4">Temperature (°C)</th>
            <th className="py-2 px-4">Humidity (%)</th>
          </tr>
        </thead>
        <tbody>
          {waterData.map((entry, index) => (
            <tr key={index} className="border-t border-gray-600">
              <td className="py-2 px-4">{new Date(entry.timestamp).toLocaleString()}</td>
              <td className="py-2 px-4">{entry.waterLevel}%</td>
              <td className="py-2 px-4">{entry.temperature}°C</td>
              <td className="py-2 px-4">{entry.humidity}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
