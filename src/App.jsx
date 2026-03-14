import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import BriefcaseButton from './Briefcase'
import './App.css'

function App() {
  const [briefcaseCount, setBriefcaseCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <BriefcaseButton 
            briefcaseCount={briefcaseCount}
            setBriefcaseCount={setBriefcaseCount}
          />
        </div>
      </section>

       <p>Briefcases opened: {briefcaseCount}</p>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
