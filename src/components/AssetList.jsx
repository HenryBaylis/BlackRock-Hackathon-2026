import { fmt } from '../utils'
import Asset from './Asset'

const BANK_INTEREST_RATE = 0.04
const BANK_TAX_RATE      = 0.20
const RENT               = 20
const INFLATION_RATE     = 0.005
const LISA_MAX_TOTAL     = 20000
const LISA_DEPOSIT_LIMIT = 4000

export default function AssetList({ cash, bank, cryptoValue, cryptoInvested, stocksValue, stocksInvested, cryptoPrice, stockPrice, priceHistory, isaValue, lisaValue, lisaDeposited, lisaCooldown, bondValue, bondInvested, actionHandlers }) {
    const canAfford = cash >= 10

    return (
        <div className="asset-grid">
            <div className="asset-card" style={{ '--accent': '#4fc3f7' }}>
                <h2 className="asset-name">🏦 Bank</h2>
                <div className="asset-price">{fmt(bank)}</div>
                <div className="asset-value">+{(BANK_INTEREST_RATE * 100).toFixed(1)}%/s interest · {BANK_TAX_RATE * 100}% tax</div>
                <div className="btn-row">
                    <button className="btn-sell" onClick={actionHandlers.withdrawBank} disabled={bank <= 0}>Withdraw</button>
                    <button className="btn-buy" onClick={actionHandlers.depositBank} disabled={!canAfford}>Deposit</button>
                </div>
            </div>
            <div className="asset-card" style={{ '--accent': '#42c98a' }}>
                <h2 className="asset-name">💰 ISA</h2>
                <div className="asset-price">{fmt(isaValue)}</div>
                <div className="asset-value">Tax-free · freely withdrawable</div>
                <div className="btn-row">
                    <button className="btn-sell" onClick={actionHandlers.withdrawIsa} disabled={isaValue <= 0}>Withdraw</button>
                    <button className="btn-buy" onClick={actionHandlers.depositIsa} disabled={!canAfford}>Deposit</button>
                </div>
            </div>
            <div className="asset-card" style={{ '--accent': '#ce93d8' }}>
                <h2 className="asset-name">🏛️ Lifetime ISA</h2>
                <div className="asset-price">{fmt(lisaValue)}</div>
                <div className="asset-value"><span>{fmt(lisaDeposited)}</span> / {fmt(LISA_MAX_TOTAL)} deposited · locked for house</div>
                <div className="btn-row" style={{ gridTemplateColumns: '1fr' }}>
                    <button className="btn-buy" onClick={actionHandlers.depositLisa} disabled={!canAfford || lisaCooldown > 0 || lisaDeposited >= LISA_MAX_TOTAL}>
                        Deposit £{LISA_DEPOSIT_LIMIT.toLocaleString()}{lisaCooldown > 0 ? ` (${lisaCooldown}s)` : ''}
                    </button>
                </div>
            </div>
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
    )
}
