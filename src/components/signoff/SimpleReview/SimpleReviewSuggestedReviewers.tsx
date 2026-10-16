import HumanDate from "@src/components/HumanDate";
import Spinner from "@src/components/Spinner";
import { useSuggestedReviewers } from "@src/hooks/reviewers";
import type { SignoffSourceInfo } from "@src/types";
import { InfoCircle } from "react-bootstrap-icons";

export default function SimpleReviewSuggestedReviewers({
  source,
}: {
  source: SignoffSourceInfo;
}) {
  const reviewers = useSuggestedReviewers(source);
  return (
    <div
      className="simple-review-suggested-reviewers"
      data-testid="simple-review-suggested-reviewers"
    >
      <strong title="Reviewers are usually notified automatically. To speed things up, reach out to one of these reviewers directly.">
        Suggested Reviewers <InfoCircle className="icon" />
      </strong>
      {reviewers === undefined && <Spinner />}
      {reviewers?.length === 0 && <p className="mb-0">None</p>}
      {reviewers && reviewers.length > 0 && (
        <ul className="mb-0">
          {reviewers.map(({ id, lastApproval }) => (
            <li key={id}>
              {id}
              {lastApproval && (
                <>
                  , last reviewed <HumanDate timestamp={lastApproval} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
