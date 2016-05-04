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
import * as NotificationsActions from "../../scripts/actions/notifications";
import jsonConfig from "../../config/config.json";


function setupBulkForm(collectionsConfig) {
  const props = {params: {name: "tasks"}};
  const comp = setupContainer(<BulkFormPage {...props} />);
  const { dispatch } = comp.store;
  dispatch(CollectionsActions.collectionsListReceived(collectionsConfig));
  dispatch(CollectionActions.select("tasks"));
  return comp;
}

describe("BulkFormPage container", () => {
  var sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(NotificationsActions, "notifyError").returns({
      type: "NOTIFICATION_ADDED"
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("Default config schema", () => {
    var comp;

    beforeEach(() => {
      comp = setupBulkForm(jsonConfig.collections);
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

    it("should notify an error when the form is empty", () => {
      Simulate.submit(findOne(comp, "form"));

      sinon.assert.calledWith(NotificationsActions.notifyError, {
        message: "The form is empty."
      });
    });
  });

  describe("Custom schema with definitions", () => {
    var comp;

    const config = {
      tasks: {
        name: "plop",
        config: {
          schema: {
            definitions: {
              version: {type: "number"}
            },
            type: "object",
            properties: {
              version: {$ref: "#/definitions/version"}
            }
          },
          uiSchema: {
            version: {
              "ui:widget": "updown"
            }
          }
        }
      }
    };

    beforeEach(() => {
      comp = setupBulkForm(config);
    });

    it("should support schema definitions references", () => {
      Simulate.click(findOne(comp, ".array-item-add button"));

      expect(nodeExists(comp, "form input[type=number]")).eql(true);
    });
  });
});
