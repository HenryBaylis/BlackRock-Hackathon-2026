import { useState, useEffect } from 'react'
import './App.css'
import { fmt } from './utils'
import Timer from './components/Timer'
import Learn from './components/Learn'
import AssetList from './components/AssetList'
import Cookie from './components/Cookie'
import BriefcaseButton from './components/Briefcase'
import Profile from './components/Profile'

// ─── Constants ───────────────────────────────────────────────────────────────

const RENT                   = 20
const INFLATION_RATE         = 0.005
const BANK_INTEREST_RATE     = 0.008
const BANK_TAX_RATE          = 0.20   // 20% tax on bank interest
const ISA_INTEREST_RATE      = 0.009  // regular ISA — tax-free, free withdrawal
const LISA_INTEREST_RATE     = 0.009  // lifetime ISA — tax-free, locked for house purchase only
const LISA_MAX_TOTAL         = 20000  // £20k lifetime cap
const LISA_DEPOSIT_LIMIT     = 4000   // max per deposit window
const LISA_DEPOSIT_INTERVAL  = 20     // seconds between deposit windows
const DOWN_PAYMENT_FRACTION  = 0.20
const GAME_DURATION          = 60
const TICK_INTERVAL          = 1
const TRANSACTION_AMOUNT     = 1000
const MAX_TICKS              = GAME_DURATION / TICK_INTERVAL  // 60

// ─── Market behaviour functions (t = current tick, 0-indexed) ────────────────

// Stocks: always net upward, no crashes — just different growth shapes
const STOCK_FUNCTIONS = [
  { name: 'Steady Growth', fn: ()  => 0.018 + (Math.random() - 0.5) * 0.020 },
  { name: 'Bull Run',      fn: (t) => 0.004 + (t / MAX_TICKS) * 0.060 + (Math.random() - 0.5) * 0.016 },
  { name: 'Slow Burn',     fn: ()  => 0.008 + (Math.random() - 0.5) * 0.010 },
  { name: 'Oscillator',    fn: (t) => 0.010 + 0.045 * Math.sin((t / MAX_TICKS) * Math.PI * 4) + (Math.random() - 0.5) * 0.012 },
  { name: 'Growth Spurt',  fn: (t) => t < MAX_TICKS * 0.6 ? 0.003 + (Math.random() - 0.5) * 0.012 : 0.080 + (Math.random() - 0.5) * 0.025 },
]

// Bonds: stable, predictable, lower returns — 5 distinct flavours
const BOND_FUNCTIONS = [
  { name: 'UK Gilt',       fn: ()  => 0.010 + (Math.random() - 0.5) * 0.006 },
  { name: 'Corp Bond',     fn: ()  => 0.018 + (Math.random() - 0.5) * 0.014 },
  { name: 'Junk Bond',     fn: ()  => 0.028 + (Math.random() - 0.5) * 0.030 },
  { name: 'Index Linked',  fn: (t) => 0.010 + (t / MAX_TICKS) * 0.025 + (Math.random() - 0.5) * 0.010 },
  { name: 'Premium Bond',  fn: ()  => Math.random() < 0.05 ? 0.35 : 0.002 },
]

// Crypto: can and will crash — each function has a distinct character
const CRYPTO_FUNCTIONS = [
  { name: 'Moon Shot',   fn: ()  => 0.055 + (Math.random() - 0.5) * 0.100 },
  { name: 'Rug Pull',    fn: (t) => t < MAX_TICKS * 0.6 ? 0.065 + (Math.random() - 0.5) * 0.040 : -0.090 + (Math.random() - 0.5) * 0.050 },
  { name: 'Crash',       fn: ()  => -0.030 + (Math.random() - 0.5) * 0.070 },
  { name: 'Volatile',    fn: ()  => (Math.random() - 0.5) * 0.160 },
  { name: 'Pump & Dump', fn: (t) => t < MAX_TICKS * 0.35 ? 0.090 + (Math.random() - 0.5) * 0.030 : t < MAX_TICKS * 0.65 ? (Math.random() - 0.5) * 0.040 : -0.080 + (Math.random() - 0.5) * 0.040 },
]


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
    bankrupt: false,
    ended: false,
    tickIndex: 0,
    stockFnIndex:  Math.floor(Math.random() * STOCK_FUNCTIONS.length),
    cryptoFnIndex: Math.floor(Math.random() * CRYPTO_FUNCTIONS.length),
    bondFnIndex:   Math.floor(Math.random() * BOND_FUNCTIONS.length),
    isaValue: 0,
    lisaValue: 0,
    lisaDeposited: 0,
    lisaNextDepositTick: 0,
    bondValue: 0,
    bondInvested: 0,
    priceHistory: {
      crypto: [1.0],
      stocks: [1.0],
      bond:   [1.0],
    },
  }
}

// ─── Pure game logic ─────────────────────────────────────────────────────────

function tick(state) {
  if (state.won) return state

  let s = { ...state }

  // Bank: interest minus 20% tax
  const bankInterest = s.bank * BANK_INTEREST_RATE
  s.bank += bankInterest * (1 - BANK_TAX_RATE)

  // Regular ISA: tax-free growth, freely withdrawable
  s.isaValue *= (1 + ISA_INTEREST_RATE)

  // Lifetime ISA: tax-free growth, locked for house purchase only
  s.lisaValue *= (1 + LISA_INTEREST_RATE)

  const stockReturn = STOCK_FUNCTIONS[s.stockFnIndex].fn(s.tickIndex)
  s.stocksValue *= (1 + stockReturn)
  const newStockPrice = s.priceHistory.stocks.at(-1) * (1 + stockReturn)

  const cryptoReturn = CRYPTO_FUNCTIONS[s.cryptoFnIndex].fn(s.tickIndex)
  s.cryptoValue *= (1 + cryptoReturn)
  const newCryptoPrice = s.priceHistory.crypto.at(-1) * (1 + cryptoReturn)

  const bondReturn = BOND_FUNCTIONS[s.bondFnIndex].fn(s.tickIndex)
  s.bondValue *= (1 + bondReturn)
  const newBondPrice = s.priceHistory.bond.at(-1) * (1 + bondReturn)

  s.tickIndex += 1

  s.priceHistory = {
    stocks: [...s.priceHistory.stocks.slice(-59), newStockPrice],
    crypto: [...s.priceHistory.crypto.slice(-59), newCryptoPrice],
    bond:   [...s.priceHistory.bond.slice(-59),   newBondPrice],
  }

  return s
}

function netWorth(s) {
  return s.cash + s.bank + s.isaValue + s.cryptoValue + s.stocksValue + s.lisaValue + s.bondValue
}

function downPaymentNeeded(s) {
  return s.housePrice * DOWN_PAYMENT_FRACTION
}

// ─── End screen ──────────────────────────────────────────────────────────────

const RANKS_WITH_AUDIO = ['badass', 'savage', 'sexy']

function EndScreen({ rank, state, nw, dp, onReset }) {
  useEffect(() => {
    if (!RANKS_WITH_AUDIO.includes(rank)) return
    const audio = new Audio(`/dmc/${rank}.mp3`)
    audio.play()
    return () => { audio.pause(); audio.currentTime = 0 }
  }, [rank])

  return (
    <div className="screen">
      <img src={`/dmc/${rank}.png`} alt={rank} style={{ width: '25%' }} />
      {state.won      && <h1>🏠 You bought a house!</h1>}
      {state.bankrupt && <h1>💸 Bankrupt!</h1>}
      {!state.won && !state.bankrupt && <h1>⏰ Time's up!</h1>}
      <p>Net worth: {fmt(nw)} — needed {fmt(dp)}</p>
      <button onClick={onReset}>{state.won ? 'Play again' : 'Try again'}</button>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(makeInitialState)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [started, setStarted] = useState(false)

  // 60-second game countdown — at 0 resolve win/loss
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setState(s => {
            if (s.won || s.bankrupt) return s
            return { ...s, ended: true, won: netWorth(s) >= downPaymentNeeded(s) }
          })
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started])

  // Every second: drain cash (rent + inflation) and update markets
  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setState(s => {
        if (s.won || s.bankrupt || s.ended) return s
        const drained = { ...s, cash: s.cash * (1 - INFLATION_RATE) - RENT }
        const next = tick(drained)
        return next.cash < 0 ? { ...next, bankrupt: true } : next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started])


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

  const depositIsa = () =>
    setState(s => ({ ...s, cash: s.cash - TRANSACTION_AMOUNT, isaValue: s.isaValue + TRANSACTION_AMOUNT }))

  const withdrawIsa = () =>
    setState(s => {
      const n = Math.min(TRANSACTION_AMOUNT, s.isaValue)
      return { ...s, cash: s.cash + n, isaValue: s.isaValue - n }
    })

  const depositLisa = () =>
    setState(s => {
      if (s.tickIndex < s.lisaNextDepositTick) return s
      if (s.lisaDeposited >= LISA_MAX_TOTAL) return s
      const n = Math.min(LISA_DEPOSIT_LIMIT, LISA_MAX_TOTAL - s.lisaDeposited)
      const bonus = 1000 // 25% government top-up on £4,000 deposit
      return { ...s, cash: s.cash - n, lisaValue: s.lisaValue + n + bonus, lisaDeposited: s.lisaDeposited + n, lisaNextDepositTick: s.tickIndex + LISA_DEPOSIT_INTERVAL }
    })

  const buyBond = () =>
    setState(s => ({ ...s, cash: s.cash - TRANSACTION_AMOUNT, bondInvested: s.bondInvested + TRANSACTION_AMOUNT, bondValue: s.bondValue + TRANSACTION_AMOUNT }))

  const sellBond = () =>
    setState(s => {
      const n = Math.min(TRANSACTION_AMOUNT, s.bondValue)
      const fraction = s.bondValue > 0 ? n / s.bondValue : 0
      return { ...s, cash: s.cash + n, bondInvested: s.bondInvested * (1 - fraction), bondValue: s.bondValue - n }
    })

  const buyHouse = () => {
    if (netWorth(state) >= downPaymentNeeded(state)) {
      setState(s => ({ ...s, won: true }))
    }
  }

  const actionHandlers = { depositBank, withdrawBank, depositIsa, withdrawIsa, depositLisa, buyCrypto, sellCrypto, buyStocks, sellStocks, buyBond, sellBond }

  const reset = () => {
    setState(makeInitialState())
    setTimeLeft(GAME_DURATION)
    setStarted(false)
  }

  const nw = netWorth(state)
  const dp = downPaymentNeeded(state)
  const progress = Math.min(nw / dp, 1)

  if (!started) {
    return (
      <div className="screen">
        <h1>🏠 House Hustle</h1>
        <p>You have 60 seconds to save a £60,000 down payment.<br />Invest wisely. Click fast. Buy the house.</p>
        <button onClick={() => setStarted(true)}>Start Game</button>
      </div>
    )
  }

  if (state.won || state.bankrupt || timeLeft === 0) {
    const rank = state.won || progress >= 0.75 ? 'sexy'
      : progress >= 0.5  ? 'savage'
      : progress >= 0.25 ? 'badass'
      : 'crazy'
    return <EndScreen rank={rank} state={state} nw={nw} dp={dp} onReset={reset} />
  }

  return (
    <div className="game">
      <header>
        <Timer timeLeft={timeLeft} />
        <Learn />
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
        netWorth={nw}
        setIncome={(newIncome) =>
          setState(prev => ({
            ...prev,
            income: newIncome
        }))
      }/>

      <BriefcaseButton 
        addCash={handleCookie}
      />

      <AssetList
        cash={state.cash}
        bank={state.bank}
        cryptoValue={state.cryptoValue}
        cryptoInvested={state.cryptoInvested}
        stocksValue={state.stocksValue}
        stocksInvested={state.stocksInvested}
        cryptoPrice={state.priceHistory.crypto.at(-1) * TRANSACTION_AMOUNT}
        stockPrice={state.priceHistory.stocks.at(-1) * TRANSACTION_AMOUNT}
        priceHistory={state.priceHistory}
        isaValue={state.isaValue}
        lisaValue={state.lisaValue}
        lisaDeposited={state.lisaDeposited}
        lisaCooldown={Math.max(0, state.lisaNextDepositTick - state.tickIndex)}
        bondValue={state.bondValue}
        bondInvested={state.bondInvested}
        actionHandlers={actionHandlers}
      />
    </div>
  )
}
