import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Droplet, ThermometerSun, Gauge, ArrowRight, Wind } from "lucide-react";

const API_URL = "https://d02ysh37xd.execute-api.us-east-1.amazonaws.com/items";

export default function WaterManagementDashboard() {
  const [waterData, setWaterData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hardcoded values
  const tankReceiverGateStatus = "OPEN"; // Change to "OFF" to test different states
  const waterFlowRate = 3.5; // Liters per second
  const gateOpenLevel = 65; // Percentage

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure we have timestamp values for charts
        const processedData = data.map((item, index) => ({
          ...item,
          timestamp:
            item.timestamp || new Date(Date.now() - index * 5000).toISOString(),
        }));

        console.log(processedData);

        setWaterData(processedData);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Changed to 10 seconds for better performance
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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

  function Header() {
    return (
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg">
            <Droplet size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Water Management Dashboard
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
          <div className="text-lg font-medium text-blue-600">
            {getGreeting()}
          </div>
          <div className="text-gray-700 font-medium">{getFormattedDate()}</div>
          <div className="text-gray-500">{getFormattedTime()}</div>
        </div>
      </div>
    );
  }

  // StatusCard component for consistent card styling
  function StatusCard({ title, value, unit, icon, color, bgColor }) {
    return (
      <div
        className={`bg-white rounded-lg shadow-md p-4 flex items-center justify-center gap-4 transition-all hover:shadow-lg min-h-[200px] w-[400px]`}
      >
        <div className={`${bgColor} ${color} p-3 rounded-lg`}>{icon}</div>
        <div>
          <h3 className="text-gray-500 font-medium">{title}</h3>
          <p className="text-2xl font-bold text-gray-800">
            {value}
            <span className="text-lg text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
      </div>
    );
  }

  function TankLevelCard({ waterLevel }) {
    // Ensure water level is within valid range
    const level = Math.max(0, Math.min(100, waterLevel || 0));

    // Determine color based on level
    const getColor = () => {
      if (level > 75) return "bg-red-500";
      if (level > 50) return "bg-yellow-500";
      return "bg-green-500";
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex flex-col col-span-1">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-700 font-medium">Reservoir Water Level</h3>
          <span className="text-2xl font-bold">{level}%</span>
        </div>

        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute h-full rounded-full transition-all duration-700 ${getColor()}`}
            style={{ width: `${level}%` }}
          />

          {/* Level indicators */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1">
            <div className="h-full w-px bg-blue-600" title="Min Level"></div>
            <div className="h-full w-px bg-red-600" title="Max Level"></div>
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    );
  }

  function GateStatusCard({ status, openLevel }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-gray-700 font-medium mb-2">Gate Status</h3>

        <div className="flex items-center justify-between">
          <div
            className={`px-3 py-1 rounded-full font-medium ${
              status === "OPEN"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>

          <div className="text-right">
            <p className="text-gray-500 text-sm">Open Level</p>
            <p className="text-xl font-bold">{openLevel}%</p>
          </div>
        </div>

        <div className="mt-4 relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${openLevel}%` }}
          />
        </div>
      </div>
    );
  }

  function ChartCard({ title, dataKey, color, data }) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 ">
        <h3 className="text-gray-700 font-medium mb-4">{title}</h3>

        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(time) =>
                new Date(time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              labelFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-100 p-6">
      <Header />

      <div className="mb-4 flex justify-between items-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => navigate("/previous-data")}
        >
          View Previous Data <ArrowRight size={16} />
        </button>

        {isLoading && (
          <p className="text-blue-600 flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
            Updating data...
          </p>
        )}
      </div>

      {waterData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* First row */}
          <TankLevelCard waterLevel={waterData[0]?.water_level || 0} />
          <GateStatusCard
            status={tankReceiverGateStatus}
            openLevel={gateOpenLevel}
          />

          <div className="flex md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto">
            <StatusCard
              title="Temperature"
              value={waterData[0]?.temperature || 0}
              unit="°C"
              icon={<ThermometerSun size={24} />}
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <StatusCard
              title="Humidity"
              value={waterData[0]?.humidity || 0}
              unit="%"
              icon={<Droplet size={24} />}
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatusCard
              title="Water Flow Rate"
              value={waterFlowRate}
              unit="L/s"
              icon={<Gauge size={24} />}
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatusCard
              title="Wind Speed"
              value={waterData[0]?.wind_speed}
              unit="kmph"
              icon={<Wind size={24} />}
              color="text-green-600"
              bgColor="bg-green-100"
            />
          </div>

          {/* Charts - One row with two charts */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard
              title="Temperature History"
              dataKey="temperature"
              color="#f97316"
              data={waterData.slice().slice(0, 12)}
            />
            <ChartCard
              title="Humidity History"
              dataKey="humidity"
              color="#3b82f6"
              data={waterData.slice().slice(0, 12)}
            />
          </div>
         
        </div>
      ) : (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-gray-700">Loading dashboard data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
