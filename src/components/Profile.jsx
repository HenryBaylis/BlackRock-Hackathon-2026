import React from "react";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const jobs = ["Intern", "Clerk", "Developer", "Manager", "Director", "CEO"];
    const jobIncomes = [50, 60, 70, 80, 90, 100];

    this.state = {
      name: "John Doe",
      job: jobs[0],
      showPopup: false,
      jobs,
      jobIncomes,
    };
  }

    componentDidMount() {
        this.interval = setInterval(() => {
        this.setState((prevState) => {
            const nextIndex = Math.min(
              prevState.jobs.indexOf(prevState.job) + 1,
              prevState.jobs.length - 1
            )

            const newIncome = prevState.jobIncomes[nextIndex]
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
            <p>Cash: £{Math.floor(this.props.cash)}</p>
            <p>Income: £{this.props.income}/click</p>
            <p>Net worth: £{Math.floor(this.props.netWorth)}</p>

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