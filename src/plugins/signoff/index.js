import React from "react";
import { Link } from "react-router";
import { takeEvery } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getClient } from "../../client";
import { routeLoadSuccess } from "../../actions/route";
import { notifySuccess, notifyError } from "../../actions/notifications";
import ProgressBar from "./ProgressBar.js";
import * as constants from "../../constants";
import { timeago, humanDate } from "../../utils";

import "./styles.css";

//
// Constants
//

const PLUGIN_REVIEW_REQUEST = "PLUGIN_REVIEW_REQUEST";
const PLUGIN_DECLINE_REQUEST = "PLUGIN_DECLINE_REQUEST";
const PLUGIN_SIGNOFF_REQUEST = "PLUGIN_SIGNOFF_REQUEST";
const SIGNOFF_WORKFLOW_INFO = "SIGNOFF_WORKFLOW_INFO";

//
// Actions
//

const SignoffActions = {
  requestReview() {
    return {type: PLUGIN_REVIEW_REQUEST};
  },
  declineChanges() {
    return {type: PLUGIN_DECLINE_REQUEST};
  },
  approveChanges() {
    return {type: PLUGIN_SIGNOFF_REQUEST};
  },
  workflowInfo(info) {
    return {type: SIGNOFF_WORKFLOW_INFO, info};
  }
};

//
// Sagas
//

function _updateCollectionAttributes(getState, data) {
  const client = getClient();
  const {
    bucket: {data: {id: bid}},
    collection: {data: {id: cid, last_modified}}
  } = getState();
  const coll = client.bucket(bid).collection(cid);
  return coll.setData(data, {safe: true, patch: true, last_modified});
}

function *onCollectionRecordsRequest(getState, action) {
  const {bid, cid} = action;
  const {session: {serverInfo}} = getState();
  const {capabilities: {signer={resources: []}}} = serverInfo;
  const resource = signer.resources.filter((r) => {
    return r.source.bucket == bid && r.source.collection == cid;
  })[0];

  yield put(SignoffActions.workflowInfo({resource}));

  if (!resource) {
    return;
  }

  const {source, preview={}, destination} = resource;

  const client = getClient();
  const fetchInfos = (batch) => {
    batch.bucket(source.bucket).collection(source.collection).getData();
    batch.bucket(preview.bucket).collection(preview.collection).getData();
    batch.bucket(destination.bucket).collection(destination.collection).getData();
  };
  const resp = yield call([client, client.batch], fetchInfos);

  const [
    sourceData,
    previewData,
    destinationData] = resp.map(({status, body: {data}}, index) => data);

  const lastSigned = destinationData ? `${destinationData.last_modified}` : "0";  // everything
  const colClient = client.bucket(bid).collection(cid);
  const {data: sourceChanges} = yield call([colClient, colClient.listRecords], {
    since: lastSigned
  });

  const information = {
    resource: {
      source: {
        ...source,
        ...sourceData,
        changes: sourceChanges
      },
      preview: {
        ...preview,
        ...previewData
      },
      destination: {
        ...destination,
        ...destinationData
      }
    }
  };
  yield put(SignoffActions.workflowInfo(information));
}

function* handleRequestReview(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "to-review"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Review requested."));
  } catch(e) {
    yield put(notifyError("Couldn't request review.", e));
  }
}

function* handleDeclineChanges(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "work-in-progress"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Changes declined."));
  } catch(e) {
    yield put(notifyError("Couldn't decline changes.", e));
  }
}

function* handleApproveChanges(getState, action) {
  const {bucket} = getState();
  try {
    const collection = yield call([this, _updateCollectionAttributes], getState, {status: "to-sign"});
    yield put(routeLoadSuccess({bucket, collection}));
    yield put(notifySuccess("Signature requested."));
  } catch(e) {
    yield put(notifyError("Couldn't approve changes.", e));
  }
}

export const sagas = [
  [takeEvery, constants.COLLECTION_RECORDS_REQUEST, onCollectionRecordsRequest],
  [takeEvery, PLUGIN_REVIEW_REQUEST, handleRequestReview],
  [takeEvery, PLUGIN_DECLINE_REQUEST, handleDeclineChanges],
  [takeEvery, PLUGIN_SIGNOFF_REQUEST, handleApproveChanges],
];

//
// Reducers
//

const INITIAL_STATE = {};

export const reducers = {
  signoff(state=INITIAL_STATE, action) {
    switch(action.type) {
      case SIGNOFF_WORKFLOW_INFO: {
        const {info: {resource}} = action;
        return {...state, resource};
      }
      default: {
        return state;
      }
    }
  }
};


//
// Components
//

class SignoffToolBar extends React.Component {
  render() {
    const {
      // Plugin state
      signoff={},
      // Actions
      requestReview,
      approveChanges,
      declineChanges} = this.props;

    const {resource} = signoff;
    // Hide toolbar if server has not kinto-signer plugin,
    // or if this collection is not configured to be signed.
    if (!resource) {
      return null;
    }

    const {source, preview, destination} = resource;
    const {status} = source;

    // Default status is request review
    const step = {"to-review": 1, "signed": 2}[status] || 0;
    const steps = [{
      label: "Work in progress",
      details: <WorkInProgress active={step === 0}
                               requestReview={requestReview}
                               source={source} />
    }, {
      label: "Waiting review",
      details: <Review active={step === 1}
                       approveChanges={approveChanges}
                       declineChanges={declineChanges}
                       source={source}
                       preview={preview} />
    }, {
      label: "Signed",
      details: <Signed active={step === 2}
                       approveChanges={approveChanges}
                       source={source}
                       destination={destination} />
    }];
    return <ProgressBar active={step} steps={steps}/>;
  }
}

function WorkInProgress({active, requestReview, source}) {
  const {
    last_author: lastAuthor,
    changes=[{}]
  } = source;
  const {last_modified: lastChange} = changes[0];
  return (
    <div>
      {lastAuthor ?
       <ul>
         <li><strong>Author: </strong> {lastAuthor}</li>
         <li><strong>Updated: </strong><span title={humanDate(lastChange)}>{timeago(lastChange)}</span></li>
       </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={requestReview}>
        <i className="glyphicon glyphicon-comment"></i> Request review
       </button> : null}
    </div>
  );
}

function Review({active, approveChanges, declineChanges, source, preview}) {
  const {
    bucket: bid,
    collection: cid,
    last_editor: lastEditor,
    last_modifed: sourceLastModified,
    changes = [{}],
  } = source;

  // XXX: take from destination?
  const {last_modified: oldestChange} = changes[changes.length - 1];

  let link = "Preview disabled";
  let lastChange = sourceLastModified;
  if (preview) {
    const {last_modified, bucket: bid, collection: cid} = preview;
    // XXX: AdminLink
    const previewURL = `/buckets/${bid}/collections/${cid}/records`;
    link = <Link to={previewURL}>{previewURL}</Link>;
    lastChange = last_modified;
  }

  return (
    <div>
      {lastEditor ?
       <ul>
         <li><strong>Editor: </strong> {lastEditor}</li>
         <li><strong>Requested: </strong><span title={humanDate(lastChange)}>{timeago(lastChange)}</span></li>
         <li>
           <strong>Changes: </strong>
           <DiffStats changes={changes} />
           {` `}<Link to={`/buckets/${bid}/collections/${cid}/history?since=${oldestChange}`}>details...</Link>
         </li>
         <li><strong>Preview URL: </strong> {link}</li>
       </ul> : null}
      {active ?
       <div className="btn-group">
         <button className="btn btn-success"
                 onClick={approveChanges}>
           <i className="glyphicon glyphicon-ok"></i> Approve
         </button>
         <button className="btn btn-danger"
                 onClick={declineChanges}>
           <i className="glyphicon glyphicon-remove"></i> Decline
         </button>
       </div> : null}
    </div>
  );
}

function DiffStats({changes}) {
  const deleted = changes.filter((r) => r.deleted).length;
  const updated = changes.length - deleted;
  return (
    <span className="diffstats">
      {updated > 0 ? <span className="text-green">+{updated}</span> : null}
      {deleted > 0 ? <span className="text-red">-{deleted}</span> : null}
    </span>
  );
}

function Signed({active, approveChanges, source, destination}) {
  const {last_reviewer: lastReviewer} = source;
  const {last_modified: lastChange} = destination;
  return (
    <div>
      {lastChange ?
       <ul>
         <li><strong>Reviewer: </strong>{lastReviewer}</li>
         <li><strong>Signed: </strong><span title={humanDate(lastChange)}>{timeago(lastChange)}</span></li>
      </ul> : null}
      {active ?
       <button className="btn btn-info"
               onClick={approveChanges}>
         <i className="glyphicon glyphicon-repeat"></i> Re-sign
       </button> : null}
    </div>
  );
}


//
// Container
//

function mapStateToProps(state) {
  const {signoff} = state;
  return {signoff};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(SignoffActions, dispatch);
}

const SignoffContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SignoffToolBar);


//
// Plugin register
//

export function register(store) {
  const hooks = {
    CollectionRecords: {
      ListActions: [
        <SignoffContainer key="request-signoff-toolbar" />
      ]
    }
  };

  return {
    hooks,
  };
}
