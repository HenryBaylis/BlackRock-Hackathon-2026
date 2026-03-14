import { useState } from 'react'

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
    body: `Your performance is judged at the end:\n• Sexy — 75%+ of target (or win)\n• Savage — 50–74%\n• Badass — 25–49%\n• Crazy — under 25%`,
  },
]

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
          </div>
        </div>
      )}
    </>
  )
}
