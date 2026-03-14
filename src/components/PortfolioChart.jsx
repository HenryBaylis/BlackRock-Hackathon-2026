
import React, { useState, useRef, useEffect } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';

export default function PortfolioChart( { newPoint } ){
  const chartOptions = {
    width: 800,
    height: 400,
    autoSize: false,
    autoScale: false,
    handleScale: false,
    mouseWheel: false, // Prevents zooming
    pinch: false,      // Prevents mobile pinch zooming
    layout: { textColor: 'white', background: { type: 'solid', color: 'black' } }
  };

  const chartRef = useRef();
  const seriesRef = useRef();
  const [prevData, setPrevData] = useState([]);
  const MAX_POINTS = 60

  useEffect(() => {
    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current.clientWidth });
    };

    const chart = createChart(chartRef.current, chartOptions);
    chart.timeScale().fitContent();
    chart.timeScale().scrollToPosition(5);

    const candleSeries = chart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
    seriesRef.current = candleSeries;

    window.addEventListener('resize', handleResize);

    candleSeries.setData([]);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove(); 
    };
  }, []);

  useEffect(() => {

    if (seriesRef.current && newPoint) {
      const updatedData = [...prevData, newPoint];

      if (updatedData.length > MAX_POINTS) {
        updatedData.shift();
      }

      setPrevData(updatedData);

      seriesRef.current.setData(updatedData);
    }
  }, [newPoint]);

  return(
    <div ref={chartRef} />
  )
}
