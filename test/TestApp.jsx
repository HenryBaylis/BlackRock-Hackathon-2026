import { useState, useEffect } from 'react';
import './App.css'
import PortfolioChart from './components/PortfolioChart.jsx'

function App() {
  const [lastPoint, setLastPoint] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = {
        time: Math.floor(Date.now() / 100),
        open: Math.random() * 1000, // example portfolio value
        high: Math.random() * 1000, // example portfolio value
        low:  Math.random() * 1000, // example portfolio value
        close: Math.random() * 1000, // example portfolio value
      };
      setLastPoint(newPoint); // only the latest point
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="chart">
        {<PortfolioChart newPoint={lastPoint} />}
      </div>
    </>
  )
}

export default App
