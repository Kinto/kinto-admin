import React from "react";

type Props = {
  children?: React.ReactNode;
};

export function ProgressBar({ children }: Props) {
  return (
    <div className="progress-steps container">
      <div className="row bs-wizard">{children}</div>
    </div>
  );
}

type ProgressStepProps = {
  label: string;
  currentStep: number;
  step: number;
  children?: React.ReactNode;
};

export function ProgressStep({
  label,
  currentStep,
  step,
  children,
}: ProgressStepProps) {
  const status =
    currentStep === step
      ? "active"
      : step < currentStep
      ? "complete"
      : "disabled";
  return (
    <div className={`col-xs-3 bs-wizard-step ${status}`} key={step}>
      <div className="text-center bs-wizard-stepnum">{label}</div>
      <div className="progress">
        <div className="progress-bar" />
      </div>
      <span className="bs-wizard-dot" />
      <div className="bs-wizard-info text-center">{children}</div>
    </div>
  );
}
