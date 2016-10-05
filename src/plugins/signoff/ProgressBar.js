import React, { Component } from "react";


export default class ProgressBar extends Component {
  render() {
    const {steps, active} = this.props;
    return (
      <div className="progress-steps container">
        <div className="row bs-wizard">
          {steps.map(({label, details}, i) => {
            const state = active == i ? "active"
                                      : i < active ? "complete"
                                                   : "disabled";
            return (
              <div className={`col-xs-3 bs-wizard-step ${state}`} key={i}>
                <div className="text-center bs-wizard-stepnum">{label}</div>
                <div className="progress"><div className="progress-bar"></div></div>
                <span className="bs-wizard-dot"></span>
                <div className="bs-wizard-info text-center">{details}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

