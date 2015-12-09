import React, { Component } from "react";

export default class BusyIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {symbol: "..."};
  }

  componentDidMount() {
    this._interval = setInterval(() => {
      const { symbol } = this.state;
      this.setState({
        symbol: symbol === "..." ? "." : symbol === "." ? ".." : "..."
      });
    }, 250);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  render() {
    return <span>{this.state.symbol}</span>;
  }
}
