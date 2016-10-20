import React, { Component } from "react";


export class ProgressBar extends Component {
  render() {
    const {children} = this.props;
    return (
      <div className="progress-steps container">
        <div className="row bs-wizard">
          {children}
        </div>
      </div>
    );
  }
}

export function ProgressStep({label, currentStep, step, children}) {
  const status = currentStep == step ? "active"
                                     : currentStep < step ? "complete"
                                                          : "disabled";
  return (
    <div className={`col-xs-3 bs-wizard-step ${status}`} key={step}>
      <div className="text-center bs-wizard-stepnum">{label}</div>
      <div className="progress"><div className="progress-bar"></div></div>
      <span className="bs-wizard-dot"></span>
      <div className="bs-wizard-info text-center">{children}</div>
    </div>
  );
}
