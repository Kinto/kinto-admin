import { expect } from "chai";
import sinon from "sinon";
import React from "react";
import { Simulate } from "react-addons-test-utils";
import KintoCollection from "kinto/lib/collection";

import {
  setupContainer,
  findOne,
  findAll,
  nodeText,
  nodeExists,
  pause
} from "../test-utils";
import BulkFormPage from "../../scripts/containers/BulkFormPage";
import * as CollectionsActions from "../../scripts/actions/collections";
import * as CollectionActions from "../../scripts/actions/collection";
import jsonConfig from "../../config/config.json";


function setupBulkForm(config) {
  const props = {params: {name: "tasks"}};
  const comp = setupContainer(<BulkFormPage {...props} />);
  const { dispatch } = comp.store;
  dispatch(CollectionsActions.collectionsListReceived(config));
  dispatch(CollectionActions.select("tasks"));
  return comp;
}


describe("BulkFormPage container", () => {
  var sandbox, comp;

  describe("Default config schema", () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      comp = setupBulkForm(jsonConfig.collections);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should render page title", () => {
      expect(nodeText(comp, "h1")).eql("Bulk tasks creation");
    });

    it("should render a form", () => {
      expect(nodeExists(comp, "form.rjsf")).eql(true);
    });

    it("should submit records", () => {
      const create = sandbox.stub(KintoCollection.prototype, "create");

      Simulate.click(findOne(comp, ".array-item-add button"));
      Simulate.change(findAll(comp, "input[type=text]")[0], {
        target: {value: "sampleTitle1"}
      });

      return pause()
        .then(() => {
          Simulate.click(findOne(comp, ".array-item-add button"));
          Simulate.change(findAll(comp, "input[type=text]")[1], {
            target: {value: "sampleTitle2"}
          });
          return pause();
        })
        .then(() => {
          Simulate.submit(findOne(comp, "form"));

          sinon.assert.calledTwice(create);
          sinon.assert.calledWith(create, {
            done: false,
            title: "sampleTitle1",
            description: ""
          });
          sinon.assert.calledWith(create, {
            done: false,
            title: "sampleTitle2",
            description: ""
          });
        });
    });
  });

  describe("Custom schema with definitions", () => {
    beforeEach(() => {
      const config = {
        collections: {
          tasks: {
            config: {
              schema: {
                definitions: {
                  version: {
                    type: "integer"
                  }
                },
                type: "object",
                properties: {
                  version: {"$ref": "#/definitions/version"}
                }
              }
            }
          }
        }
      };
      comp = setupBulkForm(config);
    });

    it("should support schema definitions references", () => {
      Simulate.click(findOne(comp, ".array-item-add button"));
      return pause()
        .then(() => {
          expect(nodeExists(comp, "form input")).eql(true);
        });
    });
  });


});
