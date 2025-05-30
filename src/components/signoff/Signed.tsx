import AdminLink from "../AdminLink";
import HumanDate from "./HumanDate";
import { ProgressStep } from "./ProgressBar";
import type { DestinationInfo, SignoffSourceInfo } from "@src/types";
import React from "react";

type SignedProps = {
  label: string;
  currentStep: number;
  step: number;
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  destination: DestinationInfo | null;
};

export function Signed(props: SignedProps) {
  const { label, currentStep, step, isCurrentUrl, source, destination } = props;
  return (
    <ProgressStep label={label} currentStep={currentStep} step={step}>
      {destination && source.lastSignatureBy && (
        <SignedInfos
          source={source}
          destination={destination}
          isCurrentUrl={isCurrentUrl}
        />
      )}
    </ProgressStep>
  );
}

type SignedInfosProps = {
  isCurrentUrl: boolean;
  source: SignoffSourceInfo;
  destination: DestinationInfo;
};

function SignedInfos(props: SignedInfosProps) {
  const { isCurrentUrl, source, destination } = props;
  const { lastReviewBy, lastReviewDate, lastSignatureBy, lastSignatureDate } =
    source;
  const { bucket, collection } = destination;
  return (
    <ul>
      <li>
        <strong>Approved: </strong>
        <HumanDate timestamp={lastReviewDate} />
      </li>
      <li>
        <strong>By: </strong>
        {lastReviewBy}
      </li>
      {lastReviewDate != lastSignatureDate && (
        <li>
          <strong>Re-signed: </strong>
          <HumanDate timestamp={lastSignatureDate} />
        </li>
      )}
      {lastReviewDate != lastSignatureDate && ( // just to avoid SyntaxError: Adjacent JSX elements
        <li>
          <strong>By: </strong>
          {lastSignatureBy}
        </li>
      )}
      {!isCurrentUrl && (
        <li>
          <strong>Destination: </strong>
          <AdminLink
            name="collection:records"
            params={{ bid: bucket, cid: collection }}
          >
            {`${bucket}/${collection}`}
          </AdminLink>
        </li>
      )}
    </ul>
  );
}
