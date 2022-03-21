# Kinto Web Administration Console

[![Greenkeeper badge](https://badges.greenkeeper.io/Kinto/kinto-admin.svg)](https://greenkeeper.io/)

[![Build Status](https://img.shields.io/github/workflow/status/Kinto/kinto-admin/test/master)](https://github.com/Kinto/kinto-admin/actions)

A Web admin UI to manage data from a [Kinto](https://kinto.readthedocs.io/) server. [Demo](http://kinto.github.io/kinto-admin/).

`kinto-admin` wants to be the [pgAdmin](http://pgadmin.org/) for
Kinto. You can also use it to build administration interfaces for
Kinto-based systems.

**Note:** This README is meant for developers. If you want to install kinto-admin on your server, head over to the [User Documentation](https://kinto.readthedocs.io/en/stable/kinto-admin.html).

## Table of Contents

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
   - [Build customization](#build-customization)
      - [Single Server](#single-server)
      - [Building for relative paths](#building-for-relative-paths)
  - [Hacking on kinto-admin](#hacking-on-kinto-admin)
  - [Development server](#development-server)
  - [Tests](#tests)
  - [FAQ](#faq)
     - [Browser support](#browser-support)
     - [How to display a nested field value using the collection displayFields property?](#how-to-display-a-nested-field-value-using-the-collection-displayfields-property)
  - [License](#license)

---

## Prerequisites

NodeJS v16+ and npm 8+ should be installed and available on your machine.

Various pre-commit hooks are available to help prevent you from
pushing sub-optimal code; to use these, ``pip install --user
pre-commit`` and ``pre-commit install``. (If you have a
``.git/hooks/pre-commit.legacy``, you can remove it.)

## Installation

The easiest way to get started is to install [create-react-app](https://github.com/facebookincubator/create-react-app) first:

```
$ npm install -g create-react-app
$ create-react-app test-kinto-admin && cd test-kinto-admin
$ npm install kinto-admin --save-dev
```

Then, import and render the main `KintoAdmin` component in the generated `src/index.js` file:

```diff
 import App from './App';
 import registerServiceWorker from './registerServiceWorker';

-ReactDOM.render(<App />, document.getElementById('root'));
+import KintoAdmin from "kinto-admin";
+
+ReactDOM.render(<KintoAdmin />, document.getElementById('root'));
 registerServiceWorker();
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



### Build customization

#### Single Server
By default, Kinto Admin gives you the option to connect to multiple Kinto Servers. If you only want Kinto Admin to connect to the server from which it's being served, you can set the `SINGLE_SERVER` flag as an environment variable when building from source:

```
SINGLE_SERVER=1 npm run build
```

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

## Flow types

To check that the flow types are correct, you first need to install
[flow-typed](https://github.com/flow-typed/flow-typed), and all the type files
for the local dependencies installed by npm:

```
$ npm install --global flow-typed
$ flow-typed install
```

You can then check for type issues with:

```
$ npm run flow-check
```

## Tests

To run tests:

```
$ npm run test-all
```

> Note: The browser test suite is not included in this command as it takes a
long time and may result in intermittent failures on Travis
(see [#146](https://github.com/Kinto/kinto-admin/pull/146)).


## FAQ

### Browser support

Let's be honest, we're mainly testing kinto-admin on recent versions of Firefox
and Chrome, so we can't really guarantee proper compatibility with IE, Safari,
Opera and others. We're accepting
[pull requests](https://github.com/Kinto/kinto-admin/pulls) though.

### How to display a nested field value using the collection displayFields property?

Use the *dot* notation.

For example, if you have the following record:

```json
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

```json
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

## Releasing

1. Bump the version number in `package.json` and run `npm i` to propagate that version to `package-lock.json`
2. Commit with `git commit -a -m "Bump vX.Y.Z"`
3. Create the tag with `git tag vX.Y.Z`
4. Push the commit with `git push`
5. Push the tag with `git push origin vX.Y.Z`
6. Publish to GitHub Pages with `npm run publish-to-gh-pages`
7. Publish the package to npm with `npm run publish-to-npm`
8. Draft a new release with the changelog
9. Done!

## License

Apache Licence Version 2.0
