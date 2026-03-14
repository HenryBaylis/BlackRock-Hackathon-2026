import { fmt } from '../utils'
import Asset from './Asset'

const BANK_INTEREST_RATE = 0.04
const BANK_TAX_RATE      = 0.20
const RENT               = 20
const INFLATION_RATE     = 0.005
const LISA_MAX_TOTAL     = 20000
const LISA_DEPOSIT_LIMIT = 4000

export default function AssetList({ cash, bank, cryptoValue, cryptoInvested, stocksValue, stocksInvested, cryptoPrice, stockPrice, priceHistory, lisaValue, lisaDeposited, lisaCooldown, bondValue, bondInvested, actionHandlers }) {
    const canAfford = cash >= 10

    return (
        <div className="balances">
            <div className="balance-card">
                <h3>💵 Cash</h3>
                <p>{fmt(Math.floor(cash))}</p>
                <small>-${RENT}/s rent · -{(INFLATION_RATE * 100).toFixed(1)}% inflation/s</small>
            </div>
            <div className="balance-card">
                <h3>🏦 Bank</h3>
                <p>{fmt(bank)}</p>
                <small>+{(BANK_INTEREST_RATE * 100).toFixed(0)}% interest · {BANK_TAX_RATE * 100}% tax</small>
                <button onClick={actionHandlers.depositBank} disabled={!canAfford}>Deposit</button>
                <button onClick={actionHandlers.withdrawBank} disabled={bank <= 0}>Withdraw</button>
            </div>
            <div className="balance-card">
                <h3>🏛️ Lifetime ISA</h3>
                <p>{fmt(lisaValue)}</p>
                <small>Tax-free · {fmt(lisaDeposited)}/{fmt(LISA_MAX_TOTAL)} deposited</small>
                <button onClick={actionHandlers.depositLisa} disabled={!canAfford || lisaCooldown > 0 || lisaDeposited >= LISA_MAX_TOTAL}>
                    Deposit {fmt(LISA_DEPOSIT_LIMIT)}{lisaCooldown > 0 ? ` (${lisaCooldown}s)` : ''}
                </button>
                <button onClick={actionHandlers.withdrawLisa} disabled={lisaValue <= 0}>Withdraw</button>
            </div>
            <div className="assets">
                <Asset
                    assetName="₿ Crypto"
                    value={cryptoValue}
                    invested={cryptoInvested}
                    currPrice={cryptoPrice}
                    onBuy={actionHandlers.buyCrypto}
                    onSell={actionHandlers.sellCrypto}
                    canBuy={canAfford}
                    priceHistory={priceHistory.crypto}
                    color="#ff9800"
                />
                <Asset
                    assetName="📈 Stocks"
                    value={stocksValue}
                    invested={stocksInvested}
                    currPrice={stockPrice}
                    onBuy={actionHandlers.buyStocks}
                    onSell={actionHandlers.sellStocks}
                    canBuy={canAfford}
                    priceHistory={priceHistory.stocks}
                    color="#4caf50"
                />
                <Asset
                    assetName="📋 Bond"
                    value={bondValue}
                    invested={bondInvested}
                    currPrice={bondValue}
                    onBuy={actionHandlers.buyBond}
                    onSell={actionHandlers.sellBond}
                    canBuy={canAfford}
                    priceHistory={priceHistory.bond}
                    color="#2196f3"
                />
            </div>
        </div>
    )
}
