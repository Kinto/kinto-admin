# Kinto Web Administration Console

[![Build Status](https://travis-ci.org/Kinto/kinto-admin.svg?branch=master)](https://travis-ci.org/Kinto/kinto-admin)

A Web admin UI to manage data from a [Kinto](https://kinto.readthedocs.io/) server. [Demo](http://kinto.github.io/kinto-admin/).

`kinto-admin` wants to be the [pgAdmin](http://pgadmin.org/) for
Kinto. You can also use it to build administration interfaces for
Kinto-based systems.

## Table of Contents

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
     - [Admin settings](#admin-settings)
     - [Plugins](#plugins)
     - [Build customization](#build-customization)
        - [Building for relative paths](#building-for-relative-paths)
  - [Hacking on kinto-admin](#hacking-on-kinto-admin)
  - [Development server](#development-server)
  - [Tests](#tests)
  - [Browser tests](#browser-tests)
  - [FAQ](#faq)
     - [Browser support](#browser-support)
     - [How to display a nested field value using the collection displayFields property?](#how-to-display-a-nested-field-value-using-the-collection-displayfields-property)
  - [License](#license)

---

## Prerequisites

NodeJS v4+ and npm 2.14+ should be installed and available on your machine.

## Installation

The easiest way to get started is to install [create-react-app](https://github.com/facebookincubator/create-react-app) first:

```
$ npm install -g create-react-app
$ create-react-app test-kinto-admin && cd test-kinto-admin
$ npm install kinto-admin --save-dev
```

Then, import and render the main `KintoAdmin` component in the generated `src/index.js` file:

```jsx
import React from "react";
import ReactDOM from "react-dom";

import KintoAdmin from "kinto-admin";

ReactDOM.render(
  <KintoAdmin />,
  document.getElementById("root")
);

```

To run a local development server:

```
$ npm start
```

To build the admin as a collection of static assets, ready to be hosted on a static webserver:

```
$ npm run build
```

This will generate production-ready assets in the `build` folder.

### Admin settings

The `KintoAdmin` component accepts a `settings` prop, where you can define the following options:

- `maxPerPage`: The max number of results per page in lists (default: `200`).
- `singleServer`: The server URL to be used (default: `null`). This removes the ability to connect to multiple servers.
- `authMethods`: The list of supported authenticated methods (default: `["basicauth", "ldap", "fxa"]`). The first is the default one.
- `sidebarMaxListedCollections`: The maximum number of bucket collections entries to list in the sidebar.

Example:

```jsx
import KintoAdmin from "kinto-admin";

ReactDOM.render(
  <KintoAdmin settings={{maxPerPage: 42}}/>,
  document.getElementById("root")
);
```

### Plugins

**Note:** The plugin API is under heavy development and will remain undocumented until it stabilizes.

To enable admin plugins, import and pass them as a `plugins` prop to the `KintoAdmin` component:

```jsx
import KintoAdmin from "kinto-admin";
import * as signoffPlugin from "kinto-admin/lib/plugins/signoff";

ReactDOM.render(
  <KintoAdmin plugins={[signoffPlugin]}/>,
  document.getElementById("root")
);
```

### Build customization

#### Building for relative paths

Quoting the ([create-react-app documentation](https://github.com/facebookincubator/create-react-app/blob/v0.4.1/template/README.md#building-for-relative-paths)):

> By default, Create React App produces a build assuming your app is hosted at the server root.
>
> To override this, specify the homepage in your `package.json`, for example:
>
> ```
>   "homepage": "http://mywebsite.com/relativepath",
> ```
>
> This will let Create React App correctly infer the root path to use in the generated HTML file.

## Hacking on kinto-admin

Clone repository:

```
$ git clone https://github.com/Kinto/kinto-admin.git
```

Install packages:

```
$ cd kinto-admin && npm install
```

After installation of packages, run the development server.

## Development server

The development server should only be used when working on the
kinto-admin codebase itself. If you're evaluating kinto-admin, or
building a system that relies on kinto-admin to administer, you should
install kinto-admin using npm and use it as above.

To run in development mode:

```
$ npm start
```

The application is served at [localhost:3000](http://localhost:3000/), and any
React component update will trigger a hot reload.

## Tests

To run tests:

```
$ npm run test-all
```

> Note: The browser test suite is not included in this command as it takes a
long time and may result in intermittent failures on Travis
(see [#146](https://github.com/Kinto/kinto-admin/pull/146)).

## Browser tests

The browser test suite uses [NightmareJS](http://www.nightmarejs.org/) and
[Electron](http://electron.atom.io/). To run browser tests:

```
$ npm run dist
$ npm run test-browser
```

To show the browser interactions while running them, set the `NIGHTMARE_SHOW` env var:

```
$ NIGHTMARE_SHOW=1 npm run test-browser
```

There's also a TDD mode:

```
$ npm run tdd-browser
```

## FAQ

### Browser support

Let's be honest, we're mainly testing kinto-admin on recent versions of Firefox
and Chrome, so we can't really guarantee proper compatibility with IE, Safari,
Opera and others. We're accepting
[pull requests](https://github.com/Kinto/kinto-admin/pulls) though.

### How to display a nested field value using the collection displayFields property?

Use the *dot* notation.

For example, if you have the following record:

```
{
  "data": {
    "attachment": {
      "filename": "font.ttf"
    }
  }
}
```

You can use `attachment.filename`.

We tried our best to make it work with properties having dots in their name.

For instance:

```
{
  "data": {
    "target": {
      "proof.hash": "abcd",
      "merkle.tree": {
         "file.name": "foobar"
      }
    }
  }
}

```

If you use `target.merkle.tree.file.name` it will render the string
`foobar` and `target.proof.hash` will render `abcd`.

## License

Apache Licence Version 2.0
