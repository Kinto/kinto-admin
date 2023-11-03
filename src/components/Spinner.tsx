import React from "react";

export default function Spinner() {
  return (
    <div className="spinner" data-testid="spinner">
      <div className="bounce1" />
      <div className="bounce2" />
      <div className="bounce3" />
    </div>
  );
}
