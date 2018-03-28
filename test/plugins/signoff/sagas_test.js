import { expect } from "chai";
import { call, put } from "redux-saga/effects";

import { notifySuccess } from "../../../src/actions/notifications";
import { routeLoadSuccess } from "../../../src/actions/route";
import { setClient } from "../../../src/client";
import * as actions from "../../../src/plugins/signoff/actions";
import * as collection_actions from "../../../src/actions/collection";
import * as saga from "../../../src/plugins/signoff/sagas";

describe("Signoff plugin sagas", () => {
  describe("list hook", () => {
    let getState;

    describe("onCollectionRecordsRequest()", () => {
      before(() => {
        getState = () => ({
          session: {
            serverInfo: {
              capabilities: {
                signer: {
                  reviewers_group: "default-reviewers",
                  resources: [
                    {
                      source: {
                        bucket: "stage",
                        collection: "source-plugins",
                      },
                      preview: {
                        bucket: "preview",
                        collection: "preview-plugins",
                      },
                      destination: {
                        bucket: "prod",
                        collection: "dest-plugins",
                      },
                      editors_group:
                        "{collection_id}_editors_who_wear_cool_sneakers",
                    },
                    {
                      source: {
                        bucket: "stage",
                      },
                      preview: {
                        bucket: "preview",
                      },
                      destination: {
                        bucket: "prod",
                      },
                    },
                  ],
                },
              },
            },
          },
        });
      });

      it("should do nothing if current collection is not configured", () => {
        const action = collection_actions.listRecords("bid", "cid", "");
        const result = saga.onCollectionRecordsRequest(getState, action);
        expect(result.next().value).eql(put(actions.workflowInfo(null)));
      });

      it("should pick resource for current collection if source matches", () => {
        const action = collection_actions.listRecords(
          "stage",
          "source-plugins",
          ""
        );
        const result = saga.onCollectionRecordsRequest(getState, action);
        expect(result.next().value).eql(
          put(
            actions.workflowInfo({
              source: {
                bid: "stage",
                cid: "source-plugins",
              },
              preview: {
                bid: "preview",
                cid: "preview-plugins",
              },
              destination: {
                bid: "prod",
                cid: "dest-plugins",
              },
            })
          )
        );
      });

      it("should update the workflow info with groups", () => {
        const action = collection_actions.listRecords(
          "stage",
          "source-plugins",
          ""
        );
        const fetchWorkflowInfoResult = {
          sourceAttributes: {
            last_author: "Last Author",
            last_editor: "Last Editor",
            last_editor_comment: "Last Editor Comment",
            last_reviewer: "Last Reviewer",
            last_reviewer_comment: "Last Reviewer Comment",
            last_modified: "sourceAttributes.last_modified",
            status: "to-review",
          },
          previewAttributes: {
            last_modified: "previewAttributes.last_modified",
          },
          destinationAttributes: {
            last_modified: "destinationAttributes.last_modified",
          },
          changes: {},
        };

        const result = saga.onCollectionRecordsRequest(getState, action);
        result.next().value; // put(), tested above
        expect(result.next().value).eql(
          call(
            saga.fetchWorkflowInfo,
            {
              bucket: "stage",
              collection: "source-plugins",
            },
            {
              bucket: "preview",
              collection: "preview-plugins",
            },
            {
              bucket: "prod",
              collection: "dest-plugins",
            }
          )
        );
        expect(result.next(fetchWorkflowInfoResult).value).eql(
          put(
            actions.workflowInfo({
              source: {
                bid: "stage",
                cid: "source-plugins",
                changes: {},
                lastAuthor: "Last Author",
                lastEditor: "Last Editor",
                lastEditorComment: "Last Editor Comment",
                lastReviewer: "Last Reviewer",
                lastReviewerComment: "Last Reviewer Comment",
                editors_group: "{collection_id}_editors_who_wear_cool_sneakers",
                reviewers_group: undefined,
                lastStatusChanged: "sourceAttributes.last_modified",
                status: "to-review",
              },
              preview: {
                bid: "preview",
                cid: "preview-plugins",
                lastRequested: "previewAttributes.last_modified",
              },
              destination: {
                bid: "prod",
                cid: "dest-plugins",
                lastSigned: "destinationAttributes.last_modified",
              },
            })
          )
        );
      });

      it("should pick resource for current collection if bucket matches", () => {
        const action = collection_actions.listRecords("stage", "cid", "");
        const result = saga.onCollectionRecordsRequest(getState, action);
        expect(result.next().value).eql(
          put(
            actions.workflowInfo({
              source: {
                bid: "stage",
                cid: "cid",
              },
              preview: {
                bid: "preview",
                cid: "cid",
              },
              destination: {
                bid: "prod",
                cid: "cid",
              },
            })
          )
        );
      });
    });
  });

  describe("review actions", () => {
    let bucket, collection, getState;

    before(() => {
      collection = {
        getData() {},
        setData() {},
      };
      bucket = {
        collection() {
          return collection;
        },
      };
      setClient({
        bucket() {
          return bucket;
        },
      });
      getState = () => ({
        bucket: { data: { id: "buck" } },
        collection: { data: { id: "coll", last_modified: 42 } },
        signoff: { resource: { destination: { lastSigned: 53 } } },
      });
    });

    describe("handleRequestReview()", () => {
      let handleRequestReview;

      before(() => {
        const action = actions.requestReview(":)");
        handleRequestReview = saga.handleRequestReview(getState, action);
      });

      it("should update the collection status as 'to-review'", () => {
        expect(handleRequestReview.next({ id: "coll" }).value)
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({ status: "to-review", last_editor_comment: ":)" });
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        )
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({ bid: "buck", cid: "coll" });
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        ).eql(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-review" } },
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleRequestReview.next().value).eql(
          put(notifySuccess("Review requested."))
        );
      });
    });

    describe("handleDeclineChanges()", () => {
      let handleDeclineChanges;

      before(() => {
        const action = actions.declineChanges(":(");
        handleDeclineChanges = saga.handleDeclineChanges(getState, action);
      });

      it("should update the collection status as 'work-in-progress'", () => {
        expect(handleDeclineChanges.next({ id: "coll" }).value)
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({
            status: "work-in-progress",
            last_reviewer_comment: ":(",
          });
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        )
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({ bid: "buck", cid: "coll" });
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        ).eql(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "work-in-progress" } },
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleDeclineChanges.next().value).eql(
          put(notifySuccess("Changes declined."))
        );
      });
    });

    describe("handleApproveChanges()", () => {
      let handleApproveChanges;

      before(() => {
        const action = actions.approveChanges();
        handleApproveChanges = saga.handleApproveChanges(getState, action);
      });

      it("should update the collection status as 'to-sign'", () => {
        expect(handleApproveChanges.next({ id: "coll" }).value)
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({ status: "to-sign", last_reviewer_comment: "" });
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        )
          .to.have.property("CALL")
          .to.have.property("args")
          .to.include({ bid: "buck", cid: "coll" });
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        ).eql(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-sign" } },
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleApproveChanges.next().value).eql(
          put(notifySuccess("Signature requested."))
        );
      });
    });
  });
});
