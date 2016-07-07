import React from "react";


// Plugin view root container component
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

export const sagas = [];

export const reducers = {};
