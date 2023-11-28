import { call, put } from "redux-saga/effects";
import { notifySuccess } from "../../src/actions/notifications";
import { routeLoadSuccess } from "../../src/actions/route";
import { setClient } from "../../src/client";
import * as actions from "../../src/actions/signoff";
import * as collection_actions from "../../src/actions/collection";
import * as saga from "../../src/sagas/signoff";

describe("Signoff sagas", () => {
  describe("list hook", () => {
    let getState;

    describe("onCollectionRecordsRequest()", () => {
      beforeAll(() => {
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
        expect(result.next().value).toStrictEqual(
          put(actions.workflowInfo(null))
        );
      });

      it("should pick resource for current collection if source matches", () => {
        const action = collection_actions.listRecords(
          "stage",
          "source-plugins",
          ""
        );
        const result = saga.onCollectionRecordsRequest(getState, action);
        expect(result.next().value).toStrictEqual(
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

      it("should update the workflow info with source attributes", () => {
        const action = collection_actions.listRecords(
          "stage",
          "source-plugins",
          ""
        );
        const fetchSourceAttributesResult = {
          last_edit_by: "Last Edit By",
          last_edit_date: "2018-04-15T16:51:23.971129+00:00",
          last_review_request_by: "Last Review Request By",
          last_review_request_date: "2018-04-16T16:51:23.971129+00:00",
          last_editor_comment: "Last Editor Comment",
          last_review_by: "Last Review By",
          last_review_date: "2018-04-17T16:51:23.971129+00:00",
          last_reviewer_comment: "Last Reviewer Comment",
          last_signature_by: "Last Signature By",
          last_signature_date: "2018-04-18T16:51:23.971129+00:00",
          last_modified: "sourceAttributes.last_modified",
          status: "to-review",
        };

        const result = saga.onCollectionRecordsRequest(getState, action);
        result.next().value; // put(), tested above
        expect(result.next().value).toStrictEqual(
          call(saga.fetchSourceAttributes, {
            bucket: "stage",
            collection: "source-plugins",
          })
        );

        const workflowInfo = {
          source: {
            bid: "stage",
            cid: "source-plugins",
            lastEditBy: "Last Edit By",
            lastEditDate: 1523811083971,
            lastEditorComment: "Last Editor Comment",
            lastReviewRequestBy: "Last Review Request By",
            lastReviewRequestDate: 1523897483971,
            lastReviewerComment: "Last Reviewer Comment",
            lastReviewBy: "Last Review By",
            lastReviewDate: 1523983883971,
            lastSignatureBy: "Last Signature By",
            lastSignatureDate: 1524070283971,
            editors_group: "{collection_id}_editors_who_wear_cool_sneakers",
            reviewers_group: undefined,
            status: "to-review",
          },
          preview: {
            bid: "preview",
            cid: "preview-plugins",
          },
          destination: {
            bid: "prod",
            cid: "dest-plugins",
          },
        };
        expect(result.next(fetchSourceAttributesResult).value).toStrictEqual(
          put(actions.workflowInfo(workflowInfo))
        );

        // Changes will be fetched for the preview collection
        const changesListResult = {
          since: 12345,
          updated: 2,
          deleted: 0,
        };
        expect(result.next().value).toStrictEqual(
          call(
            saga.fetchChangesInfo,
            {
              bucket: "stage",
              collection: "source-plugins",
            },
            {
              bucket: "prod",
              collection: "dest-plugins",
            }
          )
        );
        const workflowInfoWithChanges = {
          ...workflowInfo,
          changesOnPreview: changesListResult,
          changesOnSource: null,
        };
        expect(result.next(changesListResult).value).toStrictEqual(
          put(actions.workflowInfo(workflowInfoWithChanges))
        );
      });

      it("should pick resource for current collection if bucket matches", () => {
        const action = collection_actions.listRecords("stage", "cid", "");
        const result = saga.onCollectionRecordsRequest(getState, action);
        expect(result.next().value).toStrictEqual(
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

    beforeAll(() => {
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

      beforeAll(() => {
        const action = actions.requestReview(":)");
        handleRequestReview = saga.handleRequestReview(getState, action);
      });

      it("should update the collection status as 'to-review'", () => {
        expect(handleRequestReview.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            { status: "to-review", last_editor_comment: ":)" },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleRequestReview.next({
            data: { id: "coll", status: "to-review" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-review" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleRequestReview.next().value).toStrictEqual(
          put(notifySuccess("Review requested."))
        );
      });
    });

    describe("handleDeclineChanges()", () => {
      let handleDeclineChanges;

      beforeAll(() => {
        const action = actions.declineChanges(":(");
        handleDeclineChanges = saga.handleDeclineChanges(getState, action);
      });

      it("should update the collection status as 'work-in-progress'", () => {
        expect(handleDeclineChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            {
              status: "work-in-progress",
              last_reviewer_comment: ":(",
            },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleDeclineChanges.next({
            data: { id: "coll", status: "work-in-progress" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "work-in-progress" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleDeclineChanges.next().value).toStrictEqual(
          put(notifySuccess("Changes declined."))
        );
      });
    });

    describe("handleApproveChanges()", () => {
      let handleApproveChanges;

      beforeAll(() => {
        const action = actions.approveChanges();
        handleApproveChanges = saga.handleApproveChanges(getState, action);
      });

      it("should update the collection status as 'to-sign'", () => {
        expect(handleApproveChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            { status: "to-sign", last_reviewer_comment: "" },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleApproveChanges.next({
            data: { id: "coll", status: "to-sign" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-sign" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleApproveChanges.next().value).toStrictEqual(
          put(notifySuccess("Signature requested."))
        );
      });
    });

    describe("handleRollbackChanges()", () => {
      let handleRollbackChanges;

      beforeAll(() => {
        const action = actions.rollbackChanges("start over");
        handleRollbackChanges = saga.handleRollbackChanges(getState, action);
      });

      it("should update the collection status as 'to-rollback'", () => {
        expect(handleRollbackChanges.next({ id: "coll" }).value).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            {
              status: "to-rollback",
              last_editor_comment: "start over",
            },
          ])
        );
      });

      it("should refresh signoff resources status", () => {
        expect(
          handleRollbackChanges.next({
            data: { id: "coll", status: "to-rollback" },
          }).value
        ).toHaveProperty(
          "payload.args",
          expect.arrayContaining([
            collection_actions.listRecords("buck", "coll"),
          ])
        );
      });

      it("should dispatch the routeLoadSuccess action", () => {
        expect(
          handleRollbackChanges.next({
            data: { id: "coll", status: "to-rollback" },
          }).value
        ).toStrictEqual(
          put(
            routeLoadSuccess({
              bucket: { data: { id: "buck" } },
              collection: { data: { id: "coll", status: "to-rollback" } },
              groups: [],
              group: null,
              record: null,
            })
          )
        );
      });

      it("should dispatch a success notification", () => {
        expect(handleRollbackChanges.next().value).toStrictEqual(
          put(notifySuccess("Changes were rolled back."))
        );
      });
    });
  });
});
