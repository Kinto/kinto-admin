import React from "react";

interface Props {
  children?: React.ReactNode;
}

export function ProgressBar({ children }: Props) {
  return (
    <div className="progress-steps container p-3 m-3">
      <div className="row bs-wizard">{children}</div>
    </div>
  );
}

interface ProgressStepProps {
  label: string;
  currentStep: number;
  step: number;
  children?: React.ReactNode;
}

export function ProgressStep({
  label,
  currentStep,
  step,
  children,
}: ProgressStepProps) {
  let status = "disabled";
  if (currentStep === step) {
    status = "active";
  } else if (step < currentStep) {
    status = "complete";
  }
  return (
    <div className={`col-3 bs-wizard-step ${status}`} key={step}>
      <div className="text-center bs-wizard-stepnum">{label}</div>
      <div className="progress">
        <div className="progress-bar" />
      </div>
      <span className="bs-wizard-dot" />
      <div className="bs-wizard-info text-center">{children}</div>
    </div>
  );
}
