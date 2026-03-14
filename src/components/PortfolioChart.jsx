
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
  const chartInstanceRef = useRef();
  const [prevData, setPrevData] = useState([]);
  const MAX_POINTS = 60

  useEffect(() => {
    const chart = createChart(chartRef.current, chartOptions);
    chartInstanceRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, { upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350' });
    seriesRef.current = candleSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

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
      chartInstanceRef.current.timeScale().fitContent();
    }
  }, [newPoint]);

  return(
    <div ref={chartRef} />
  )
}
