import { fmt } from '../utils'
import Asset from './Asset'

const BANK_INTEREST_RATE = 0.04
const RENT               = 20
const INFLATION_RATE     = 0.005

export default function AssetList({ cash, bank, cryptoValue, cryptoInvested, stocksValue, stocksInvested, cryptoPrice, stockPrice, actionHandlers }) {
  const canAfford = cash >= 10

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
        <button onClick={actionHandlers.depositBank} disabled={!canAfford}>Deposit</button>
        <button onClick={actionHandlers.withdrawBank} disabled={bank <= 0}>Withdraw</button>
      </div>
      <Asset
        assetName="₿ Crypto"
        value={cryptoValue}
        invested={cryptoInvested}
        currPrice={cryptoPrice}
        onBuy={actionHandlers.buyCrypto}
        onSell={actionHandlers.sellCrypto}
        canBuy={canAfford}
      />
      <Asset
        assetName="📈 Stocks"
        value={stocksValue}
        invested={stocksInvested}
        currPrice={stockPrice}
        onBuy={actionHandlers.buyStocks}
        onSell={actionHandlers.sellStocks}
        canBuy={canAfford}
      />
    </div>
  )
}