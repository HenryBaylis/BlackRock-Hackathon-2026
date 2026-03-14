import { fmt } from '../utils'

const BANK_INTEREST_RATE = 0.04
const RENT               = 20
const INFLATION_RATE     = 0.005

export default function Assets({ cash, bank, cryptoValue, stocksValue }) {
  return (
    <div className="balances">
      <div className="balance-card">
        <h3>💵 Cash</h3>
        <p>{fmt(cash)}</p>
        <small>-${RENT}/s rent · -{(INFLATION_RATE * 100).toFixed(1)}% inflation/s</small>
      </div>
      <div className="balance-card">
        <h3>🏦 Bank</h3>
        <p>{fmt(bank)}</p>
        <small>+{(BANK_INTEREST_RATE * 100).toFixed(0)}% interest</small>
      </div>
      <div className="balance-card">
        <h3>₿ Crypto</h3>
        <p>{fmt(cryptoValue)}</p>
        <small>High risk, high reward</small>
      </div>
      <div className="balance-card">
        <h3>📈 Stocks</h3>
        <p>{fmt(stocksValue)}</p>
        <small>Slow steady growth</small>
      </div>
    </div>
  )
}
