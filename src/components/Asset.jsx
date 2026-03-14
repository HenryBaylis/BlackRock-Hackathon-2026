import { fmt } from '../utils'

const Asset = ({ assetName, value, invested, currPrice, onBuy, onSell, canBuy }) => {
  const profitAndLoss = value - invested
  const profitAndLossPositive = profitAndLoss >= 0

  return (
    <div>
      <h1>{assetName}</h1>
      <div>${currPrice.toFixed(2)}</div>
      <div>Value: {fmt(value)}</div>
      <div style={{ color: profitAndLossPositive ? 'green' : 'red' }}>
        P&L: {profitAndLossPositive ? '+' : ''}{fmt(profitAndLoss)}
      </div>
      <button onClick={onSell} disabled={value <= 0}>Sell</button>
      <button onClick={onBuy} disabled={!canBuy}>Buy</button>
    </div>
  )
}

export default Asset