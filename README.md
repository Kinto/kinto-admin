# Kinto Web Administration Console

[![Build Status](https://img.shields.io/github/workflow/status/Kinto/kinto-admin/CI/master)](https://github.com/Kinto/kinto-admin/actions)

A Web admin UI to manage data from a [Kinto](https://kinto.readthedocs.io/) server. [Demo](https://kinto.github.io/kinto-admin/).

`kinto-admin` wants to be the [pgAdmin](https://www.pgadmin.org/) for
Kinto. You can also use it to build administration interfaces for
Kinto-based systems.

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
  - [Releasing](#releasing)
  - [License](#license)

---

## Prerequisites

NodeJS v16+ and npm 8+ should be installed and available on your machine.

Various pre-commit hooks are available to help prevent you from
pushing sub-optimal code; to use these, ``pip install --user
pre-commit`` and ``pre-commit install``. (If you have a
``.git/hooks/pre-commit.legacy``, you can remove it.)

## Installation

The easiest way to install and use Kinto Admin on your server is to:
- download a [release](https://github.com/Kinto/kinto-admin/releases/) from Github.

- Unzip the directory, then install dependencies:
```
$ cd kinto-admin && npm install
```

- Build the static bundle with:
```
$ npm run build
```

This will generate a production-ready assets in a `build` directory, ready to be served from your server of choice.

## Build customization
Use the following options to customize the Kinto Admin build.

### Single Server
By default, Kinto Admin gives you the option to connect to multiple Kinto Servers. If you only want Kinto Admin to connect to the server from which it's being served, you can set the `KINTO_ADMIN_SINGLE_SERVER` flag as an environment variable:

```
KINTO_ADMIN_SINGLE_SERVER=1 npm run build
```

### Building for relative paths
By default, Kinto Admin assumes assets will be served from the root path (`/`) of the server. If you'd like to serve assets from a different location, set that option with an `ASSET_PATH` environment variable:

```
ASSET_PATH="/some/prefix/" npm run build
```

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
`kinto-admin` codebase itself. If you're evaluating Kinto Admin, or
building a system that relies on Kinto Admin to administer, you should
install Kinto Admin using the installation instructions above.

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
7. Draft a new release with the changelog
8. Done!

## Deploying to github-pages
A github workflow is included that will release to github pages for any user acceptence testing you may want to do. You must enable github pages first and allow deployment from github actions (Settings > Pages).

By default, most branches are restricted from deploying. Additional branches can be allowed to deploy (or any can be allowed) under Settings > Environments > github-pages.

## License

Apache Licence Version 2.0
