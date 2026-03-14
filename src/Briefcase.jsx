import React from "react";
import briefcaseImg from "./assets/briefcase.png";
import cashImg from "./assets/cash.png";

class BriefcaseButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPressed: false,
    };
  }

  handleClick = () => {
    this.setState({ isPressed: true });
    this.props.setBriefcaseCount(this.props.briefcaseCount + 1);

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
      </div>
    );
  }
}

export default BriefcaseButton;