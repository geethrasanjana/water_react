import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { ArrowLeft, Calendar, Download } from "lucide-react";

const API_URL = "https://d02ysh37xd.execute-api.us-east-1.amazonaws.com/items";

export default function PreviousData() {
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you'd include date parameters in the API call
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Simulate historical data by adding timestamps
        const now = new Date();
        const historicalData = data.map((item, index) => ({
          ...item,
          timestamp: new Date(now - (index * 3600000)).toISOString() // Each entry is 1 hour apart
        }));
        
        setHistoricalData(historicalData);
        
        // Set default date range (last 7 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        setDateRange({
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
        
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setError("Failed to load historical data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
    
    // In a real application, you would refetch data with the new date range
  };

  const exportData = () => {
    // Create CSV content
    const headers = ["Timestamp", "Temperature", "Humidity", "Water Level"];
    const csvContent = [
      headers.join(","),
      ...historicalData.map(item => 
        [
          new Date(item.timestamp).toLocaleString(),
          item.temperature,
          item.humidity,
          item.water_level
        ].join(",")
      )
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `water_data_${dateRange.start}_to_${dateRange.end}.csv`);
    document.body.appendChild(link);
    
    // Start download and cleanup
    link.click();
    document.body.removeChild(link);
  };

  function Header() {
    return (
      <div className="w-full bg-white shadow-md p-4 mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Historical Water Data</h1>
        </div>
        
        <button
          onClick={exportData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export Data
        </button>
      </div>
    );
  }

  function DateFilter() {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={18} />
          Select Date Range
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          
          <div className="flex items-end">
            <button 
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              onClick={() => {
                // In a real app, this would trigger a new data fetch
                alert("Data would be filtered by date range in a real application");
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  function DataTable() {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temperature (°C)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Humidity (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Water Level (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historicalData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.temperature}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.humidity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.water_level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-red-500 text-xl font-bold mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 w-screen">
      <Header />
      <DateFilter />
      
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mb-4 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-700">Loading historical data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-medium mb-4">Temperature History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    tick={{fontSize: 12}}
                    stroke="#888"
                  />
                  <YAxis tick={{fontSize: 12}} stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{r: 2}}
                    name="Temperature (°C)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-gray-700 font-medium mb-4">Humidity & Water Level</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(time) => new Date(time).toLocaleDateString()}
                    tick={{fontSize: 12}}
                    stroke="#888"
                  />
                  <YAxis tick={{fontSize: 12}} stroke="#888" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{r: 2}}
                    name="Humidity (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="water_level" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{r: 2}}
                    name="Water Level (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <DataTable />
        </>
      )}
    </div>
  );
}