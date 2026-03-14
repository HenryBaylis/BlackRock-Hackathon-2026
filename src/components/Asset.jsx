import { fmt } from '../utils'

const W = 220
const H = 60

function Sparkline({ data, color }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * (H - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const points = pts.join(' ')
  const lastPt = pts.at(-1).split(',')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${points} ${W},${H} 0,${H}`} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  )
}

const Asset = ({ assetName, value, invested, currPrice, onBuy, onSell, canBuy, priceHistory, color }) => {
  const profitAndLoss = value - invested
  const profitAndLossPositive = profitAndLoss >= 0

  return (
    <div className="asset-card" style={{ '--accent': color }}>
      <h2 className="asset-name">{assetName}</h2>
      <div className="sparkline-wrap">
        <Sparkline data={priceHistory} color={color} />
      </div>
      <div className="asset-price">${currPrice.toFixed(2)}</div>
      <div className="asset-value">Value <span>{fmt(value)}</span></div>
      <div className="asset-pnl" style={{ color: profitAndLossPositive ? '#42c98a' : '#e05555' }}>
        P&L {profitAndLossPositive ? '+' : ''}{fmt(profitAndLoss)}
      </div>
      <div className="btn-row">
        <button className="btn-sell" onClick={onSell} disabled={value <= 0}>Sell</button>
        <button className="btn-buy" onClick={onBuy} disabled={!canBuy}>Buy</button>
      </div>
    </div>
  )
}

export default Asset