export default function Money({ actionHandlers }) {
  return (
    <div className="invest-panel">
      <div className="invest-actions">
        <div>
          <h4>🏦 Bank</h4>
          <button onClick={actionHandlers.depositBank}>Deposit</button>
          <button onClick={actionHandlers.withdrawBank}>Withdraw</button>
        </div>
        <div>
          <h4>₿ Crypto</h4>
          <button onClick={actionHandlers.buyCrypto}>Buy</button>
          <button onClick={actionHandlers.sellCrypto}>Sell</button>
        </div>
        <div>
          <h4>📈 Stocks</h4>
          <button onClick={actionHandlers.buyStocks}>Buy</button>
          <button onClick={actionHandlers.sellStocks}>Sell</button>
        </div>
      </div>
    </div>
  )
}
