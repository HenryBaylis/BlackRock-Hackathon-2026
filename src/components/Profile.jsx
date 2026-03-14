import React from "react";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const jobs = ["Intern", "Clerk", "Developer", "Manager", "Director", "CEO"];

    this.state = {
      name: "John Doe",
      job: jobs[0],
      showPopup: false, 
      jobs
    };
  }

    componentDidMount() {
        this.interval = setInterval(() => {
        this.setState((prevState) => {
            const nextIndex =
            (prevState.jobs.indexOf(prevState.job) + 1) % prevState.jobs.length

            // double income
            const newIncome = this.props.income * 2
            this.props.setIncome(newIncome)

            // trigger popup
            this.showJobPopup();

            return {
            job: prevState.jobs[nextIndex]
            }
        })
        }, 10000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    showJobPopup = () => {
        this.setState({ showPopup: true });
        setTimeout(() => {
        this.setState({ showPopup: false });
        }, 2000); // popup disappears after 2 seconds
    };

    render() {
        return (
        <section className="profile">
            <h2>Job: {this.state.job}</h2>
            <p>Cash: ${Math.floor(this.props.cash)}</p>
            <p>Income: ${this.props.income}</p>

            {this.state.showPopup && (
                <div className="job-popup">
                    🎉 You Got A New Job! 🎉
                </div>
            )}
        </section>
        )
    }
}

export default Profile;