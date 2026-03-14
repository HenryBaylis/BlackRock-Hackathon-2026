const W = 200
const H = 60

function Sparkline({ data, color }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = H - ((v - min) / range) * H
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export default function Stocks({ priceHistory, stockName, cryptoName, bondName }) {
  return (
    <div className="stocks-panel">
      <div className="sparkline">
        <h4>📈 Stocks — {stockName}</h4>
        <Sparkline data={priceHistory.stocks} color="#4caf50" />
      </div>
      <div className="sparkline">
        <h4>📋 Bond — {bondName}</h4>
        <Sparkline data={priceHistory.bond} color="#2196f3" />
      </div>
      <div className="sparkline">
        <h4>₿ Crypto — {cryptoName}</h4>
        <Sparkline data={priceHistory.crypto} color="#ff9800" />
      </div>
    </div>
  )
}
