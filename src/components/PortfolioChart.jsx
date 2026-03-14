
import React, { useRef, useEffect } from 'react';
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
  const dataRef = useRef([]);
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
      dataRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current || !newPoint) return
    dataRef.current = [...dataRef.current, newPoint]
    if (dataRef.current.length > MAX_POINTS) dataRef.current.shift()
    seriesRef.current.setData(dataRef.current)
    chartInstanceRef.current.timeScale().fitContent()
  }, [newPoint]);

  return(
    <div ref={chartRef} />
  )
}
