import { useState, useEffect } from 'react'
import './App.css'
import { fmt } from './utils'
import Timer from './components/Timer'
import Assets from './components/Assets'
import Money from './components/Money'
import Stocks from './components/Stocks'
import BriefcaseButton from './components/Briefcase'
import Profile from './components/Profile'

// ─── Constants ───────────────────────────────────────────────────────────────

const RENT                  = 20    // deducted from cash every second
const INFLATION_RATE        = 0.005 // cash loses 0.5% every second
const BANK_INTEREST_RATE    = 0.008 // per second (was 0.04 per 5s tick)
const DOWN_PAYMENT_FRACTION = 0.20
const GAME_DURATION         = 60
const TICK_INTERVAL         = 1
const OPTION_INTERVAL       = 4
const TRANSACTION_AMOUNT    = 2500
const MAX_TICKS             = GAME_DURATION / TICK_INTERVAL  // 60

// ─── Market behaviour functions (t = current tick, 0-indexed) ────────────────

const STOCK_FUNCTIONS = [
  { name: 'Steady Growth',  fn: ()       => 0.010 + (Math.random() - 0.5) * 0.008 },
  { name: 'Bull Run',       fn: (t)      => 0.002 + (t / MAX_TICKS) * 0.028 + (Math.random() - 0.5) * 0.006 },
  { name: 'Bear Market',    fn: ()       => -0.006 + (Math.random() - 0.5) * 0.012 },
  { name: 'Volatile',       fn: ()       =>           (Math.random() - 0.45) * 0.04 },
  { name: 'Sine Wave',      fn: (t)      => 0.020  * Math.sin((t / MAX_TICKS) * Math.PI * 2) + (Math.random() - 0.5) * 0.004 },
]

const CRYPTO_FUNCTIONS = [
  { name: 'Moon Shot',      fn: ()       => 0.030 + (Math.random() - 0.5) * 0.050 },
  { name: 'Crash',          fn: ()       => -0.016 + (Math.random() - 0.5) * 0.040 },
  { name: 'Pump & Dump',    fn: (t)      => t < MAX_TICKS / 2 ? 0.036 + (Math.random() - 0.5) * 0.020 : -0.024 + (Math.random() - 0.5) * 0.030 },
  { name: 'Sleeper',        fn: (t)      => t < MAX_TICKS * 0.7 ? 0.002 + (Math.random() - 0.5) * 0.010 : 0.080 + (Math.random() - 0.5) * 0.020 },
  { name: 'Mania',          fn: (t)      => (t / MAX_TICKS) * 0.10 * (Math.random() - 0.4) },
]

const ALL_ACTIONS = [
  { id: 'depositBank',  label: 'Deposit',  group: '🏦 Bank' },
  { id: 'withdrawBank', label: 'Withdraw', group: '🏦 Bank' },
  { id: 'buyCrypto',    label: 'Buy',      group: '₿ Crypto' },
  { id: 'sellCrypto',   label: 'Sell',     group: '₿ Crypto' },
  { id: 'buyStocks',    label: 'Buy',      group: '📈 Stocks' },
  { id: 'sellStocks',   label: 'Sell',     group: '📈 Stocks' },
]

function pickActions() {
  return [...ALL_ACTIONS].sort(() => Math.random() - 0.5).slice(0, 3)
}

function makeInitialState() {
  return {
    cash: 1000,
    income: 50,
    bank: 0,
    cryptoInvested: 0,
    cryptoValue: 0,
    stocksInvested: 0,
    stocksValue: 0,
    housePrice: 300000,
    won: false,
    tickIndex: 0,
    stockFnIndex:  Math.floor(Math.random() * STOCK_FUNCTIONS.length),
    cryptoFnIndex: Math.floor(Math.random() * CRYPTO_FUNCTIONS.length),
    priceHistory: {
      crypto: [1.0],
      stocks: [1.0],
    },
  }
}

// ─── Pure game logic ─────────────────────────────────────────────────────────

function tick(state) {
  if (state.won) return state

  let s = { ...state }

  s.bank *= (1 + BANK_INTEREST_RATE)

  const stockReturn = STOCK_FUNCTIONS[s.stockFnIndex].fn(s.tickIndex)
  s.stocksValue *= (1 + stockReturn)
  const newStockPrice = s.priceHistory.stocks.at(-1) * (1 + stockReturn)

  const cryptoReturn = CRYPTO_FUNCTIONS[s.cryptoFnIndex].fn(s.tickIndex)
  s.cryptoValue *= (1 + cryptoReturn)
  const newCryptoPrice = s.priceHistory.crypto.at(-1) * (1 + cryptoReturn)

  s.tickIndex += 1

  s.priceHistory = {
    stocks: [...s.priceHistory.stocks.slice(-59), newStockPrice],
    crypto: [...s.priceHistory.crypto.slice(-59), newCryptoPrice],
  }

  return s
}

function netWorth(s) {
  return s.cash + s.bank + s.cryptoValue + s.stocksValue
}

function downPaymentNeeded(s) {
  return s.housePrice * DOWN_PAYMENT_FRACTION
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(makeInitialState)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [visibleActions, setVisibleActions] = useState(() => pickActions())

  // 60-second game countdown — at 0 resolve win/loss
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setState(s => {
            if (s.won) return s
            return { ...s, won: netWorth(s) >= downPaymentNeeded(s) }
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Every second: drain cash (rent + inflation) and update markets
  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        if (s.won) return s
        const drained = { ...s, cash: s.cash * (1 - INFLATION_RATE) - RENT }
        return tick(drained)
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Rotate available actions every OPTION_INTERVAL seconds
  useEffect(() => {
    const id = setInterval(() => setVisibleActions(pickActions()), OPTION_INTERVAL * 1000)
    return () => clearInterval(id)
  }, [])

  const handleCookie = () => setState(s => ({ ...s, cash: s.cash + s.income }))

  const depositBank = () =>
    setState(s => ({ ...s, cash: s.cash - TRANSACTION_AMOUNT, bank: s.bank + TRANSACTION_AMOUNT }))

  const withdrawBank = () =>
    setState(s => {
      const n = Math.min(TRANSACTION_AMOUNT, s.bank)
      return { ...s, cash: s.cash + n, bank: s.bank - n }
    })

  const buyCrypto = () =>
    setState(s => ({ ...s, cash: s.cash - TRANSACTION_AMOUNT, cryptoInvested: s.cryptoInvested + TRANSACTION_AMOUNT, cryptoValue: s.cryptoValue + TRANSACTION_AMOUNT }))

  const sellCrypto = () =>
    setState(s => {
      const n = Math.min(TRANSACTION_AMOUNT, s.cryptoValue)
      const fraction = s.cryptoValue > 0 ? n / s.cryptoValue : 0
      return { ...s, cash: s.cash + n, cryptoInvested: s.cryptoInvested * (1 - fraction), cryptoValue: s.cryptoValue - n }
    })

  const buyStocks = () =>
    setState(s => ({ ...s, cash: s.cash - TRANSACTION_AMOUNT, stocksInvested: s.stocksInvested + TRANSACTION_AMOUNT, stocksValue: s.stocksValue + TRANSACTION_AMOUNT }))

  const sellStocks = () =>
    setState(s => {
      const n = Math.min(TRANSACTION_AMOUNT, s.stocksValue)
      const fraction = s.stocksValue > 0 ? n / s.stocksValue : 0
      return { ...s, cash: s.cash + n, stocksInvested: s.stocksInvested * (1 - fraction), stocksValue: s.stocksValue - n }
    })

  const buyHouse = () => {
    if (netWorth(state) >= downPaymentNeeded(state)) {
      setState(s => ({ ...s, won: true }))
    }
  }

  const actionHandlers = { depositBank, withdrawBank, buyCrypto, sellCrypto, buyStocks, sellStocks }

  const reset = () => {
    setState(makeInitialState())
    setTimeLeft(GAME_DURATION)
    setVisibleActions(pickActions())
  }

  const nw = netWorth(state)
  const dp = downPaymentNeeded(state)
  const progress = Math.min(nw / dp, 1)

  if (state.won) return (
    <div className="screen">
      <h1>🏠 You bought a house!</h1>
      <p>Net worth: {fmt(nw)}</p>
      <button onClick={reset}>Play again</button>
    </div>
  )

  if (timeLeft === 0) return (
    <div className="screen">
      <h1>⏰ Time's up!</h1>
      <p>Net worth: {fmt(nw)} — needed {fmt(dp)}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )

  return (
    <div className="game">
      <header>
        <span>Net worth: {fmt(nw)}</span>
        <Timer timeLeft={timeLeft} />
      </header>

      {/* House progress */}
      <div className="house-progress">
        <p>Down payment: {fmt(nw)} / {fmt(dp)}</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <button onClick={buyHouse} disabled={nw < dp}>
          🏠 Buy House ({fmt(dp)} down payment needed)
        </button>
      </div>
      <Profile 
        cash={state.cash}
        income={state.income}
        setIncome={(newIncome) =>
          setState(prev => ({
            ...prev,
            income: newIncome
        }))
      }/>

      <BriefcaseButton 
        addCash={handleCookie}
      />

      <Assets
        cash={state.cash}
        bank={state.bank}
        cryptoValue={state.cryptoValue}
        stocksValue={state.stocksValue}
      />

      <Stocks
        priceHistory={state.priceHistory}
        stockName={STOCK_FUNCTIONS[state.stockFnIndex].name}
        cryptoName={CRYPTO_FUNCTIONS[state.cryptoFnIndex].name}
      />

      <Money
        visibleActions={visibleActions}
        actionHandlers={actionHandlers}
      />
    </div>
  )
}
