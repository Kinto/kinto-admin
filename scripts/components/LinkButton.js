import React from "react";
import { Link } from "react-router";

/**
 * A react-router compliant linked button.
 *
 * @param  {Object} props
 * @return {React.Component}
 */
export default props => {
  return (
    <Link className="link-button" {...props}>
      <button type="button">{props.label}</button>
    </Link>
  );
};
