import React from "react";
import briefcaseImg from "../assets/briefcase.png";
import cashImg from "../assets/cash.png";

class BriefcaseButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPressed: false,
      cashList: [] // list of flying cash
    };
  }

  handleClick = () => {
    this.setState({ isPressed: true });
    this.props.addCash()

    // create flying cash
    const newCash = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100, // random horizontal
      y: Math.random() * -200,      // random upward
      r: Math.random() * 360 ,        // rotation
      style: { transform: "translate(0,0) rotate(0deg)", opacity: 1 }
    }));

    this.setState(prev => ({
      cashList: [...prev.cashList, ...newCash]
    }));

    // animate each cash particle
    setTimeout(() => {
      this.setState(prev => ({
        cashList: prev.cashList.map(c => ({
          ...c,
          style: {
            transform: `translate(${c.x}px, ${c.y}px) rotate(${c.r}deg)`,
            opacity: 0,
            transition: "transform 1s ease-out, opacity 1s ease-out"
          }
        }))
      }));
    }, 100); // short delay to trigger transition

    // remove cash after animation
    setTimeout(() => {
      this.setState({ cashList: [] });
    }, 1200);

    setTimeout(() => {
      this.setState({ isPressed: false });
    }, 100);
  };

  render() {
    const briefcaseStyle = {
      width: "200px",
      cursor: "pointer",
      transform: this.state.isPressed ? "scale(0.85)" : "scale(1)",
      transition: "transform 0.1s"
    };

    const containerStyle = {
      position: "relative",
      display: "inline-block"
    };

    return (
      <div style={containerStyle}>
        <img
          src={briefcaseImg}
          alt="Briefcase"
          style={briefcaseStyle}
          onClick={this.handleClick}
        />

        {this.state.cashList.map(cash => (
          <img
            key={cash.id}
            src={cashImg}
            alt="cash"
            style={{
              position: "absolute",
              left: "50%",
              top: "0",
              width: "100px",
              pointerEvents: "none",
              ...cash.style
            }}
          />
        ))}

        <style>
          {`
            @keyframes flyCash {
              0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
              100% { transform: translate(var(--x)px, var(--y)px) rotate(var(--r)deg); opacity: 0; }
            }
          `}
        </style>
      </div>
    );
  }
}

export default BriefcaseButton;