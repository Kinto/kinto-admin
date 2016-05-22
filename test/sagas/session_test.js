import { expect } from "chai";
import { put, call } from "redux-saga/effects";

import * as actions from "../../scripts/actions/session";
import * as saga from "../../scripts/sagas/session";
import { setClient } from "../../scripts/client";


describe("session sagas", () => {
  describe("listBuckets()", () => {
    let client, bucket, listBuckets;

    before(() => {
      bucket = {
        getAttributes() {},
        listCollections() {}
      };
      client = setClient({
        bucket() {return bucket;},
        listBuckets() {}
      });
      listBuckets = saga.listBuckets();
    });

    it("should ping the default bucket", () => {
      expect(listBuckets.next().value)
        .eql(call([bucket, bucket.getAttributes]));
    });

    it("should fetch the list of buckets", () => {
      expect(listBuckets.next().value)
        .eql(call([client, client.listBuckets]));
    });

    it("should list collections for each bucket", () => {
      expect(listBuckets.next({data: [{id: "b1"}, {id: "b2"}]}).value)
        .eql(call([bucket, bucket.listCollections], "b1"));

      expect(listBuckets.next({data: [{id: "b1c1"}, {id: "b1c2"}]}).value)
        .eql(call([bucket, bucket.listCollections], "b2"));
    });

    it("should dispatch the list of buckets", () => {
      expect(listBuckets.next({data: [{id: "b2c1"}]}).value)
        .eql(put(actions.bucketsSuccess([
          {
            id: "b1",
            collections: [{id: "b1c1"}, {id: "b1c2"}]
          },
          {
            id: "b2",
            collections: [{id: "b2c1"}]
          }
        ])));
    });
  });
});
