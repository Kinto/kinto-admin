import React from "react";


const PLUGIN_SIGNOFF_REQUEST = "PLUGIN_SIGNOFF_REQUEST";

// Actions
function requestSignoff() {
  return {type: PLUGIN_SIGNOFF_REQUEST};
}

class Signoff extends React.Component {
  render() {
    const {params} = this.props;
    const {bid, cid} = params;
    return (
      <div>
        <h1>Signoff the <b>{bid}/{cid}</b> collection</h1>
        <p>In the future, you'll be able to sign off this collection here.</p>
      </div>
    );
  }
}

export const routes = [
  {
    path: "/buckets/:bid/collections/:cid/signoff",
    components: {
      content: Signoff
    }
  }
];

export const hooks = {
  CollectionList: {
    ListActions: [
      <a key="request-signoff-btn" className="btn btn-info" href="#">Request signoff</a>
    ]
  }
};

export const sagas = [];

export const reducers = {};
