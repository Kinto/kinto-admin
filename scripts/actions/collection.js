import Kinto from "kinto";
import btoa from "btoa";

import * as CollectionsActions from "./collections";
import * as NotificationsActions from "./notifications";
import * as FormActions from "./form";
import { updatePath } from "redux-simple-router";

export const COLLECTION_LOADED = "COLLECTION_LOADED";
export const COLLECTION_BUSY = "COLLECTION_BUSY";
export const COLLECTION_READY = "COLLECTION_READY";
export const COLLECTION_SYNCED = "COLLECTION_SYNCED";

export var kinto;

export function configureKinto(settings) {
  const encodedCreds = btoa(settings.username + ":" + settings.password);
  kinto = new Kinto({
    remote:   settings.server,
    bucket:   settings.bucket, // XXX for custom bucket, need creation
    dbPrefix: settings.username,  // XXX prefix can be empty (same data for everyone)
    headers:  {Authorization: "Basic " + encodedCreds}
  });
}

// Helpers
function formatSyncErrorDetails(syncResult) {
  let details = [];
  if (syncResult.errors.length > 0) {
    details = details.concat(syncResult.errors.map(_error => {
      var _message;
      if (_error.type === "outgoing") {
        const {error, message, code, errno} = _error.error;
        _message = `errno ${errno}, ${message}: ${code} ${error}`;
      } else {
        _message = _error.message;
      }
      return `${_error.type} error: ${_message}`;
    }));
  }
  if (syncResult.conflicts.length > 0) {
    details = details.concat(syncResult.conflicts.map(conflict => {
      return `${conflict.type} conflict: ${conflict.remote.id}`;
    }));
  }
  return details;
}

// Sync
export function configure(name, config) {
  return {
    type: COLLECTION_READY,
    name,
    config,
    schema: config.schema
  };
}

export function loaded(records) {
  return {type: COLLECTION_LOADED, records};
}

function busy(flag) {
  return {type: COLLECTION_BUSY, flag};
}

// Async
export function select(name) {
  return (dispatch, getState) => {
    try {
      configureKinto(getState().settings);
    } catch(err) {
      const error = new Error(
        `Cannot configure Kinto: ${err.message}; please check your settings.`);
      return dispatch(NotificationsActions.notifyError(error));
    }
    const collections = getState().collections;
    if (!collections.hasOwnProperty(name)) {
      const error = new Error(`Collection "${name}" is not available.`);
      return dispatch(NotificationsActions.notifyError(error));
    }
    const config = collections[name].config;
    if (!config) {
      const error = new Error(`The "${name}" collection is not configured.`);
      return dispatch(NotificationsActions.notifyError(error));
    }
    dispatch(configure(name, config));
  };
}

export function selectAndLoad(name) {
  return (dispatch, getState) => {
    const selectAction = select(name);
    selectAction(dispatch, getState);
    dispatch(load());
  };
}

function withCollection(fn) {
  return (dispatch, getState) => {
    if (!kinto) {
      const error = new Error("Kinto is not properly configured. " +
                              "Please check the settings.");
      return dispatch(NotificationsActions.notifyError(error));
    }
    const collName = getState().collection.name;
    if (!collName) {
      throw new Error("Missing collection name.");
    }
    fn(dispatch, kinto.collection(collName), collName);
  };
}

function execute(dispatch, promise, options = {}) {
  dispatch(NotificationsActions.clearNotifications());
  dispatch(busy(true));
  return Promise.resolve(promise)
    .then(res => {
      if (options.message) {
        dispatch(NotificationsActions.notifyInfo(options.message));
      }
      if (options.redirect) {
        dispatch(updatePath(options.redirect));
      }
      dispatch(load());
    })
    .catch(err => {
      dispatch(NotificationsActions.notifyError(err));
    })
    .then(_ => {
      dispatch(busy(false));
    });
}

export function load() {
  return withCollection((dispatch, collection, collName) => {
    dispatch(busy(true));
    return collection.list()
      .then(res => {
        dispatch(loaded(res.data));
        return collection.gatherLocalChanges();
      })
      .catch(err => {
        dispatch(NotificationsActions.notifyError(err));
      })
      .then(({toDelete, toSync}) => {
        dispatch(busy(false));
        dispatch(CollectionsActions.markSynced(
          collName, toDelete.length + toSync.length === 0));
      });
  });
}

export function loadRecord(id) {
  return withCollection((dispatch, collection) => {
    return collection.get(id)
      .then(res => {
        dispatch(FormActions.recordLoaded(res.data));
      });
  });
}

export function create(record) {
  return withCollection((dispatch, collection) => {
    execute(dispatch, collection.create(record), {
      message: "The record has been created.",
      redirect: `/collections/${collection._name}`,
    });
  });
}

export function update(record) {
  return withCollection((dispatch, collection) => {
    execute(dispatch, collection.update(record), {
      message: `Record ${record.id} has been updated.`,
      redirect: `/collections/${collection._name}`,
    });
  });
}

export function deleteRecord(id) {
  return withCollection((dispatch, collection) => {
    execute(dispatch, collection.delete(id), {
      message: `Record ${id} has been deleted.`,
    });
  });
}

export function sync(options) {
  return withCollection((dispatch, collection) => {
    const syncPromise = collection.sync(options)
      .then(res => {
        if (res.ok) {
          return res;
        }
        const err = new Error("Synchronization failed.");
        err.details = formatSyncErrorDetails(res);
        throw err;
      });
    execute(dispatch, syncPromise, {
      message: "The collection has been synchronized.",
    });
  });
}

export function resetSync() {
  return withCollection((dispatch, collection) => {
    execute(dispatch, collection.resetSyncStatus(), {
      message: "All local record sync statuses have been reset.",
    });
  });
}
