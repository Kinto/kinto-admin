import React from "react";
import { findDOMNode } from "react-dom";
import { Simulate, renderIntoDocument } from "react-addons-test-utils";
import { Provider } from "react-redux";
import configureStore from "../scripts/store/configureStore";


export function findAll(comp, sel) {
  const node = findDOMNode(comp);
  if (!node) {
    throw new Error("Could not find component DOM node.");
  }
  return [].slice.call(node.querySelectorAll(sel));
}

export function findOne(comp, sel) {
  const node = findDOMNode(comp);
  if (!node) {
    throw new Error("Could not find component DOM node.");
  }
  return node.querySelector(sel);
}

export function setupContainer(container, initialState) {
  const store = configureStore(initialState);
  return renderIntoDocument(
    <Provider store={store}>
      {container}
    </Provider>
  );
}

export function prop(name) {
  return obj => obj[name];
}

export function mapNodes(comp, sel, fn) {
  return findAll(comp, sel).map(fn);
}

export function mapNodesProp(comp, sel, propName) {
  return mapNodes(comp, sel, prop(propName));
}

export function nodeTexts(comp, sel) {
  return mapNodesProp(comp, sel, "textContent");
}

export function nodeText(comp, sel) {
  return findOne(comp, sel).textContent;
}

export function nodeExists(comp, sel) {
  return !!findOne(comp, sel);
}

export function click(comp, sel, event) {
  const node = findOne(comp, sel);
  if (!node) {
    throw new Error("Can't click on missing node: " + sel);
  }
  Simulate.click(node, event);
}
