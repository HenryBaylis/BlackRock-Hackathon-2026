import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

function Eq({ tex }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false }) }} />
}

function BlockEq({ tex }) {
  return <div style={{ margin: '6px 0' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(tex, { throwOnError: false, displayMode: true }) }} />
}

const SECTIONS = [
  {
    title: '🎯 Goal',
    body: `You have 60 seconds to save enough for a house down payment — 20% of £300,000 = £60,000. Buy the house the moment your net worth hits that target, or wait for the timer to judge you.`,
  },
  {
    title: '💵 Cash',
    body: `Your spendable money. It drains every second from two sources: rent (flat £20/s) and inflation (0.5%/s). Holding cash long-term loses you money — put it to work.`,
  },
  {
    title: '💼 Briefcase',
    body: `Click the briefcase to earn income. Your job upgrades automatically every 10 seconds, doubling your income each time. Fast clicking early is important.`,
  },
  {
    title: '🏦 Bank',
    body: `Safe and steady. Earns 0.8% interest per second, but 20% tax is deducted from all interest earned. Better than holding cash but slower than investing.`,
  },
  {
    title: '💰 ISA',
    body: `A tax-free savings account. Earns 0.9%/s with no tax deducted. Deposit and withdraw freely in £1,000 increments. Better than the bank for flexible savings.`,
  },
  {
    title: '🏛️ Lifetime ISA',
    body: `Tax-free and earns 0.9%/s, but the money is locked — it can only be used toward buying the house. You can deposit £4,000 every 20 seconds up to a £20,000 lifetime cap. Each deposit triggers a £1,000 government bonus (25% top-up), just like the real thing. Fill it as early as possible and let it grow.`,
  },
  {
    title: '📈 Stocks',
    body: `Each game randomly picks one of five market behaviours: Steady Growth, Bull Run, Slow Burn, Oscillator, or Growth Spurt. Stocks never crash — they always trend upward, just at different rates and shapes. Transactions are fixed at £1,000.`,
  },
  {
    title: '📋 Bonds',
    body: `Lower risk than stocks. Five types: UK Gilt (ultra-stable), Corp Bond (steady), Junk Bond (higher yield, riskier), Index Linked (grows stronger over time), and Premium Bond (mostly flat but with rare 20% windfall ticks).`,
  },
  {
    title: '₿ Crypto',
    body: `High risk, high reward — and it can crash hard. Each game picks one of five behaviours: Moon Shot (wild upside), Rug Pull (rises then collapses), Crash (bleeds out), Volatile (pure chaos), or Pump & Dump (spike then fall). Only invest what you can afford to lose.`,
  },
  {
    title: '🏆 Ranks',
    body: `Your performance is judged at the end:\n• 🔥 Smoking Sexy Style — Buy the house, or reach 75%+ of the down payment\n• ⚔️ Savage — 50–74% of the down payment\n• 💪 Badass — 25–49% of the down payment\n• 🤪 Crazy — under 25% of the down payment`,
  },
]

function Equations() {
  return (
    <div className="learn-section">
      <h3>📐 Market Equations</h3>
      <p style={{ marginBottom: '0.6rem', fontSize: '0.8rem', opacity: 0.7 }}>
        All values are per-tick return rates. <Eq tex="r_t" /> is applied as <Eq tex="\text{value} \times (1 + r_t)" /> each second.
      </p>

      <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.2rem' }}>Stocks</p>
      <BlockEq tex="\text{Steady Growth:}\quad r_t = 0.012 + \mathcal{U}(-0.008,\,0.008)" />
      <BlockEq tex="\text{Bull Run:}\quad r_t = 0.003 + \frac{t}{60}(0.040) + \mathcal{U}(-0.007,\,0.007)" />
      <BlockEq tex="\text{Slow Burn:}\quad r_t = 0.006 + \mathcal{U}(-0.004,\,0.004)" />
      <BlockEq tex="\text{Oscillator:}\quad r_t = 0.008 + 0.030\sin\!\left(\frac{4\pi t}{60}\right) + \mathcal{U}(-0.005,\,0.005)" />
      <BlockEq tex="\text{Growth Spurt:}\quad r_t = \begin{cases} 0.002 + \mathcal{U}(-0.005,\,0.005) & t < 36 \\ 0.055 + \mathcal{U}(-0.010,\,0.010) & t \geq 36 \end{cases}" />

      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.8rem 0 0.2rem' }}>Crypto</p>
      <BlockEq tex="\text{Moon Shot:}\quad r_t = \begin{cases} 0.025 + \mathcal{U}(-0.190,\,0.190) & t < 39 \\ -0.40 + \mathcal{U}(-0.050,\,0.050) & t \geq 39 \end{cases}" />
      <BlockEq tex="\text{Rug Pull:}\quad r_t = \begin{cases} 0.030 + \mathcal{U}(-0.170,\,0.170) & t < 33 \\ -0.42 + \mathcal{U}(-0.045,\,0.045) & t \geq 33 \end{cases}" />
      <BlockEq tex="\text{Early Crash:}\quad r_t = \begin{cases} -0.48 + \mathcal{U}(-0.050,\,0.050) & t < 12 \\ -0.008 + \mathcal{U}(-0.030,\,0.030) & t \geq 12 \end{cases}" />
      <BlockEq tex="\text{Volatile:}\quad r_t = \begin{cases} 0.020 + \mathcal{U}(-0.230,\,0.230) & t < 30 \\ -0.40 + \mathcal{U}(-0.055,\,0.055) & t \geq 30 \end{cases}" />
      <BlockEq tex="\text{Pump \& Dump:}\quad r_t = \begin{cases} 0.035 + \mathcal{U}(-0.200,\,0.200) & t < 18 \\ -0.44 + \mathcal{U}(-0.045,\,0.045) & t \geq 18 \end{cases}" />
      <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.4rem' }}>
        Crypto price capped at <Eq tex="2\times" /> starting value. <Eq tex="\mathcal{U}(a,b)" /> = uniform random on <Eq tex="[a,\,b]" />.
      </p>
    </div>
  )
}

export default function Learn() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="learn-btn" onClick={() => setOpen(true)}>Learn</button>

      {open && (
        <div className="learn-overlay" onClick={() => setOpen(false)}>
          <div className="learn-modal" onClick={e => e.stopPropagation()}>
            <button className="learn-close" onClick={() => setOpen(false)}>✕</button>
            <h2>How to Play</h2>
            {SECTIONS.map(s => (
              <div key={s.title} className="learn-section">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
            <Equations />
          </div>
        </div>
      )}
    </>
  )
}
