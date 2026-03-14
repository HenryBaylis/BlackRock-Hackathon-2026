import { useState, useEffect, useRef } from 'react'
import './App.css'
import { fmt } from './utils'
import Timer from './components/Timer'
import Learn from './components/Learn'
import AssetList from './components/AssetList'
import Cookie from './components/Cookie'
import BriefcaseButton from './components/Briefcase'
import Profile from './components/Profile'
import PortfolioChart from './components/PortfolioChart'

// ─── Constants ───────────────────────────────────────────────────────────────
// The game runs for 60 seconds. Each second is one "tick".
// All rates are per-tick (i.e. per second).

const RENT                   = 40     // £ drained from cash every tick — simulates monthly rent compressed into the game window
const INFLATION_RATE         = 0.015  // 1.5% of cash lost to inflation every tick — holding cash is actively punished
const BANK_INTEREST_RATE     = 0.008  // 0.8%/tick gross interest on bank balance
const BANK_TAX_RATE          = 0.20   // 20% tax on bank interest — mirrors UK basic rate income tax on savings
const ISA_INTEREST_RATE      = 0.009  // 0.9%/tick, tax-free — slightly better than bank because no tax deducted
const LISA_INTEREST_RATE     = 0.009  // same rate as ISA, but locked — can only be used toward the house purchase
const LISA_MAX_TOTAL         = 20000  // £20k lifetime deposit cap, matching the real UK Lifetime ISA rules
const LISA_DEPOSIT_LIMIT     = 4000   // max £4k per deposit window — real UK annual LISA allowance compressed to 20s
const LISA_DEPOSIT_INTERVAL  = 20     // seconds between deposit windows (represents the annual deposit cycle)
const DOWN_PAYMENT_FRACTION  = 0.20   // 20% deposit required — standard UK mortgage minimum
const GAME_DURATION          = 60     // total game length in seconds
const TICK_INTERVAL          = 1      // one tick per second
const TRANSACTION_AMOUNT     = 1000   // all buy/sell/deposit actions are fixed at £1,000 increments
const MAX_TICKS              = GAME_DURATION / TICK_INTERVAL  // 60 ticks total

// ─── Market behaviour functions (t = current tick, 0-indexed) ────────────────
// Each function returns a per-tick return rate (e.g. 0.02 = +2% this tick).
// One of each category is randomly selected at the start of each game,
// so the player doesn't know which behaviour they're dealing with.

// Stocks: always trend upward overall — no crashes, just different growth shapes.
// The base return is positive; noise adds variability but can't sustain a crash.
const STOCK_FUNCTIONS = [
  { name: 'Steady Growth', fn: ()  => 0.018 + (Math.random() - 0.5) * 0.020 },                                                              // consistent ~1.8%/tick with mild noise
  { name: 'Bull Run',      fn: (t) => 0.004 + (t / MAX_TICKS) * 0.060 + (Math.random() - 0.5) * 0.016 },                                    // accelerates over time — patience is rewarded
  { name: 'Slow Burn',     fn: ()  => 0.008 + (Math.random() - 0.5) * 0.010 },                                                              // modest steady gains, low noise
  { name: 'Oscillator',    fn: (t) => 0.010 + 0.045 * Math.sin((t / MAX_TICKS) * Math.PI * 4) + (Math.random() - 0.5) * 0.012 },            // cycles up and down but net positive — timing matters
  { name: 'Growth Spurt',  fn: (t) => t < MAX_TICKS * 0.6 ? 0.003 + (Math.random() - 0.5) * 0.012 : 0.080 + (Math.random() - 0.5) * 0.025 }, // flat early, then rockets in the final stretch
]

// Bonds: locked for a fixed term (10s or 20s), lower but reliable returns.
// Each bond type has different risk/reward — junk bonds pay more but swing harder.
const BOND_FUNCTIONS = [
  { name: 'UK Gilt',       fn: ()  => 0.010 + (Math.random() - 0.5) * 0.006 },                                         // ultra-stable government bond, lowest risk
  { name: 'Corp Bond',     fn: ()  => 0.018 + (Math.random() - 0.5) * 0.014 },                                         // corporate bond, moderate yield and noise
  { name: 'Junk Bond',     fn: ()  => 0.028 + (Math.random() - 0.5) * 0.030 },                                         // high yield but can go negative — high risk
  { name: 'Index Linked',  fn: (t) => 0.010 + (t / MAX_TICKS) * 0.025 + (Math.random() - 0.5) * 0.010 },               // improves as the game progresses — rewards holding
  { name: 'Premium Bond',  fn: ()  => Math.random() < 0.05 ? 0.35 : 0.002 },                                           // 5% chance of a 35% windfall each tick, otherwise near-zero
]

// Crypto: all 5 behaviours eventually crash — the only question is when.
// Pre-crash: chaotic oscillation (can spike up or down wildly each tick).
// Post-crash: sustained heavy losses of ~40%+/tick, wiping out most of the value.
// The price is capped at 2x to prevent runaway gains; the crash is uncapped downward.
const CRYPTO_FUNCTIONS = [
  // Moon Shot: violent swings either way, then collapses hard at tick 39 (65%)
  { name: 'Moon Shot',   fn: (t) => t < MAX_TICKS * 0.65 ? (Math.random() - 0.5) * 0.420 : -0.40 + (Math.random() - 0.5) * 0.100 },
  // Rug Pull: slight upward bias with huge noise, then floor drops at tick 33 (55%)
  { name: 'Rug Pull',    fn: (t) => t < MAX_TICKS * 0.55 ? 0.010 + (Math.random() - 0.5) * 0.380 : -0.42 + (Math.random() - 0.5) * 0.090 },
  // Early Crash: obliterated immediately in the first 12 ticks (20%), then slow bleed
  { name: 'Early Crash', fn: (t) => t < MAX_TICKS * 0.20 ? -0.48 + (Math.random() - 0.5) * 0.100 : -0.008 + (Math.random() - 0.5) * 0.060 },
  // Volatile: pure chaos (±25%/tick), rug pull at tick 30 (50%)
  { name: 'Volatile',    fn: (t) => t < MAX_TICKS * 0.50 ? (Math.random() - 0.5) * 0.500 : -0.40 + (Math.random() - 0.5) * 0.110 },
  // Pump & Dump: spiky rise early, then dumps hard at tick 18 (30%) — punishes late buyers
  { name: 'Pump & Dump', fn: (t) => t < MAX_TICKS * 0.30 ? 0.015 + (Math.random() - 0.5) * 0.440 : -0.44 + (Math.random() - 0.5) * 0.090 },
]


// Returns a fresh game state. Called on first load and on reset.
// Market function indices are randomised here so each game has a different market.
function makeInitialState() {
  return {
    cash: 1000,          // starting cash balance
    income: 100,         // £ earned per briefcase click (scales with job promotions)
    bank: 0,
    cryptoInvested: 0,   // total £ put into crypto (used to calculate P&L)
    cryptoValue: 0,      // current market value of crypto holdings
    stocksInvested: 0,
    stocksValue: 0,
    housePrice: 300000,  // fixed target — player needs 20% = £60k
    won: false,
    bankrupt: false,     // true if cash goes negative
    ended: false,        // true when the 60s timer expires (even if not won/bankrupt)
    tickIndex: 0,        // increments every second — used by market functions and bond maturity
    // randomly pick one behaviour per asset class for this game session
    stockFnIndex:  Math.floor(Math.random() * STOCK_FUNCTIONS.length),
    cryptoFnIndex: Math.floor(Math.random() * CRYPTO_FUNCTIONS.length),
    bondFnIndex:   Math.floor(Math.random() * BOND_FUNCTIONS.length),
    isaValue: 0,
    lisaValue: 0,
    lisaDeposited: 0,          // tracks total deposited into LISA (cap enforced at £20k)
    lisaNextDepositTick: 0,    // tick at which the next LISA deposit window opens
    bonds: [],                 // array of { value, unlockTick } — each locked bond position
    bondsInvested: 0,          // total £ locked into bonds (for end-screen P&L)
    bondsReturned: 0,          // total £ returned when bonds matured (for end-screen P&L)
    // profit trackers — accumulated each tick, used for end-screen analytics
    bankProfit: 0,
    isaProfit: 0,
    lisaProfit: 0,
    lisaBonusTotal: 0,         // total government bonus received from LISA deposits
    priceHistory: {
      crypto: [1.0],   // normalised price index — starts at 1.0, used for sparkline charts
      stocks: [1.0],
      bond:   [1.0],
    },
  }
}

// ─── Pure game logic ─────────────────────────────────────────────────────────
// tick() is a pure function — it takes the current state and returns the next state.
// It is called once per second by the game loop interval in App.
// Cash drain (rent + inflation) is applied BEFORE tick() is called.

function tick(state) {
  if (state.won) return state  // freeze state if already won

  let s = { ...state }  // shallow copy — we mutate s then return it

  // ── Savings accounts ──────────────────────────────────────────────────────
  // Bank pays interest but 20% is taken as tax (mirrors UK income tax on savings)
  const bankInterest = s.bank * BANK_INTEREST_RATE
  const bankGain = bankInterest * (1 - BANK_TAX_RATE)
  s.bank += bankGain
  s.bankProfit += bankGain  // accumulated for end-screen analytics

  // ISA grows at the same rate as the bank but with zero tax deducted
  const isaGain = s.isaValue * ISA_INTEREST_RATE
  s.isaValue += isaGain
  s.isaProfit += isaGain

  // LISA also grows tax-free, but the balance can only be used toward the house
  const lisaGain = s.lisaValue * LISA_INTEREST_RATE
  s.lisaValue += lisaGain
  s.lisaProfit += lisaGain

  // ── Stocks ────────────────────────────────────────────────────────────────
  // Returns are always net positive over time — stocks reward patience
  const stockReturn = STOCK_FUNCTIONS[s.stockFnIndex].fn(s.tickIndex)
  s.stocksValue *= (1 + stockReturn)
  const newStockPrice = s.priceHistory.stocks.at(-1) * (1 + stockReturn)

  // ── Crypto ────────────────────────────────────────────────────────────────
  // Price is capped at 2x to prevent runaway gains.
  // The effective return is recalculated from the capped price so the value stays consistent.
  const cryptoReturn = CRYPTO_FUNCTIONS[s.cryptoFnIndex].fn(s.tickIndex)
  const rawCryptoPrice = s.priceHistory.crypto.at(-1) * (1 + cryptoReturn)
  const newCryptoPrice = Math.min(rawCryptoPrice, 2.0)  // cap at 2x starting price
  const effectiveCryptoReturn = s.priceHistory.crypto.at(-1) > 0 ? (newCryptoPrice / s.priceHistory.crypto.at(-1)) - 1 : cryptoReturn
  s.cryptoValue *= (1 + effectiveCryptoReturn)

  // ── Bonds ─────────────────────────────────────────────────────────────────
  // Each bond is a locked position { value, unlockTick }.
  // Every tick: grow all bond values, then check if any have matured (unlockTick reached).
  // Matured bonds are removed from the array and their value is returned to cash.
  const bondReturn = BOND_FUNCTIONS[s.bondFnIndex].fn(s.tickIndex)
  const newBondPrice = s.priceHistory.bond.at(-1) * (1 + bondReturn)
  const grownBonds = s.bonds.map(b => ({ ...b, value: b.value * (1 + bondReturn) }))
  const matured = grownBonds.filter(b => s.tickIndex >= b.unlockTick)   // bonds whose lock period has expired
  s.bonds = grownBonds.filter(b => s.tickIndex < b.unlockTick)          // keep only still-locked bonds
  const maturedTotal = matured.reduce((sum, b) => sum + b.value, 0)
  s.cash += maturedTotal          // auto-deposit matured bond value back into cash
  s.bondsReturned += maturedTotal

  // ── Advance tick ─────────────────────────────────────────────────────────
  s.tickIndex += 1

  // Keep a rolling 60-tick price history for the sparkline charts (normalised index, starts at 1.0)
  s.priceHistory = {
    stocks: [...s.priceHistory.stocks.slice(-59), newStockPrice],
    crypto: [...s.priceHistory.crypto.slice(-59), newCryptoPrice],
    bond:   [...s.priceHistory.bond.slice(-59),   newBondPrice],
  }

  return s
}

// Sum of all assets — used for house purchase check, progress bar, and end-screen
function netWorth(s) {
  const bondsTotal = s.bonds.reduce((sum, b) => sum + b.value, 0)
  return s.cash + s.bank + s.isaValue + s.cryptoValue + s.stocksValue + s.lisaValue + bondsTotal
}

// The target the player needs to hit — 20% of the £300k house price = £60k
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

  const remainingBondValue = state.bonds.reduce((sum, b) => sum + b.value, 0)
  const bondPnl = state.bondsReturned + remainingBondValue - state.bondsInvested
  const stockPnl = state.stocksValue - state.stocksInvested
  const cryptoPnl = state.cryptoValue - state.cryptoInvested

  const analytics = [
    { label: '🏦 Bank interest',   value: state.bankProfit },
    { label: '💰 ISA interest',    value: state.isaProfit },
    { label: '🏛️ LISA growth',    value: state.lisaProfit + state.lisaBonusTotal },
    { label: '📈 Stocks P&L',      value: stockPnl },
    { label: '₿ Crypto P&L',       value: cryptoPnl },
    { label: '📋 Bonds P&L',       value: bondPnl },
  ]

  const advice = []
  if (state.lisaDeposited < 8000)
    advice.push({ emoji: '🏛️', text: 'You didn\'t use the Lifetime ISA enough. The government tops up every £4,000 deposit with a free £1,000 bonus — that\'s a guaranteed 25% return before any interest. It\'s one of the best tools for buying your first home.' })
  if (cryptoPnl < 0)
    advice.push({ emoji: '₿', text: 'You lost money on crypto. Crypto is extremely volatile and frequently crashes to near zero — it\'s the highest risk asset in the game. Only put in money you can afford to lose entirely, and get out before the rug pull.' })
  if (state.bank > 2000 && state.isaValue < state.bank / 2)
    advice.push({ emoji: '💰', text: 'You kept a lot in the bank but not in an ISA. Both earn interest, but the ISA is completely tax-free — the bank takes 20% of every penny of interest it pays you. Moving savings into an ISA is a free gain.' })
  if (state.cash > 2000 && state.cash > nw * 0.25)
    advice.push({ emoji: '💵', text: 'You left a lot of money sitting as cash. Cash loses value every second through rent and inflation — it\'s the worst place to store wealth. Even the bank or an ISA will grow your money rather than drain it.' })

  return (
    <div className="screen">
      <img src={`/dmc/${rank}.png`} alt={rank} style={{ width: '50%' }} />
      <p>{fmt(nw)} / {fmt(dp)} down payment</p>
      <table className="analytics">
        <tbody>
          {analytics.map(({ label, value }) => (
            <tr key={label}>
              <td>{label}</td>
              <td style={{ color: value >= 0 ? '#42c98a' : '#e05555', textAlign: 'right' }}>
                {value >= 0 ? '+' : ''}{fmt(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {advice.length > 0 && (
        <div className="advice-section">
          <h3>💡 What to do better</h3>
          {advice.map(({ emoji, text }) => (
            <div key={emoji} className="advice-item">
              <span className="advice-emoji">{emoji}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      )}
      <button onClick={onReset}>Try again</button>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [state, setState] = useState(makeInitialState)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [started, setStarted] = useState(false)
  const [latestCandle, setLatestCandle] = useState(null)
  const prevNwRef = useRef(1000)
  const gameStartTimeRef = useRef(0)

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

  // Generate a candle whenever tickIndex advances
  useEffect(() => {
    if (!started || state.tickIndex === 0) return
    const open = prevNwRef.current
    const close = netWorth(state)
    prevNwRef.current = close
    setLatestCandle({
      time: gameStartTimeRef.current + state.tickIndex,
      open,
      high: Math.max(open, close),
      low:  Math.min(open, close),
      close,
    })
  }, [state.tickIndex])


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
      return { ...s, cash: s.cash - n, lisaValue: s.lisaValue + n + bonus, lisaDeposited: s.lisaDeposited + n, lisaNextDepositTick: s.tickIndex + LISA_DEPOSIT_INTERVAL, lisaBonusTotal: s.lisaBonusTotal + bonus }
    })

  const lockBond = (duration) =>
    setState(s => ({
      ...s,
      cash: s.cash - TRANSACTION_AMOUNT,
      bonds: [...s.bonds, { value: TRANSACTION_AMOUNT, unlockTick: s.tickIndex + duration }],
      bondsInvested: s.bondsInvested + TRANSACTION_AMOUNT,
    }))

  const buyHouse = () => {
    if (netWorth(state) >= downPaymentNeeded(state)) {
      setState(s => ({ ...s, won: true }))
    }
  }

  const actionHandlers = { depositBank, withdrawBank, depositIsa, withdrawIsa, depositLisa, buyCrypto, sellCrypto, buyStocks, sellStocks, lockBond }

  const reset = () => {
    setState(makeInitialState())
    setTimeLeft(GAME_DURATION)
    setStarted(false)
    setLatestCandle(null)
    prevNwRef.current = 1000
    gameStartTimeRef.current = 0
  }

  const nw = netWorth(state)
  const dp = downPaymentNeeded(state)
  const progress = Math.min(nw / dp, 1)

  if (!started) {
    return (
      <div className="screen">
        <h1>🏠 House Hustle</h1>
        <p>You have 60 seconds to save a £60,000 down payment.<br />Invest wisely. Click fast. Buy the house.</p>
        <button onClick={() => { gameStartTimeRef.current = Math.floor(Date.now() / 1000); setStarted(true) }}>Start Game</button>
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

      <PortfolioChart newPoint={latestCandle} />

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
        bonds={state.bonds}
        tickIndex={state.tickIndex}
        actionHandlers={actionHandlers}
      />
    </div>
  )
}
