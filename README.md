# Kinto Web Administration Console

[![Build Status](https://travis-ci.org/Kinto/kinto-admin.svg)](https://travis-ci.org/Kinto/kinto-admin)

A Web admin UI to manage data from a [Kinto](https://kinto.readthedocs.io/) server.
[Give it a go](http://kinto.github.io/kinto-admin/)!

`kinto-admin` wants to be the [pgAdmin](http://pgadmin.org/) for
Kinto. You can also use it to build administration interfaces for
Kinto-based systems.

## Table of Contents

  - [Installation](#installation)
  - [Standalone local server](#standalone-local-server)
  - [Building static assets for production hosting](#building-static-assets-for-production-hosting)
  - [Build kinto-admin locally](#build-kinto-admin-locally)
  - [Development server](#development-server)
  - [FAQ](#faq)
     - [Browser support](#browser-support)
     - [I get an ENOENT when I go to localhost:3000](#i-get-an-enoent-when-i-go-to-localhost-3000)
     - [How to display a nested field value using the collection displayFields property?](#how-to-display-a-nested-field-value-using-the-collection-displayfields-property)
  - [License](#license)

---

## Installation

NodeJS v4+ and npm 2.14+ should be installed and available on your machine.

```bash
$ npm install -g kinto-admin
```

Or if you want it to be installed as a project dependency:

```bash
$ npm install kinto-admin --save
```

## Standalone local server

The Web admin UI can be served locally using the `kinto-admin` executable:

```bash
$ kinto-admin serve
Listening at http://0.0.0.0:3000
```

You can specify the port to listen to using the `--port` or `-p` options:

```bash
$ kinto-admin serve -p 4000
Listening at http://0.0.0.0:4000
```

## Building static assets for production hosting

```
$ kinto-admin build -d static-build
```

Here, production-ready assets are generated into the `static-build/` directory,
and can be published to any static webserver like
[github-pages](https://pages.github.com/).

## Build kinto-admin locally

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

## FAQ

### Browser support

Let's be honest, we're mainly testing kinto-admin on recent versions of Firefox
and Chrome, so we can't really guarantee proper compatibility with IE, Safari,
Opera and others. We're accepting
[pull requests](https://github.com/Kinto/kinto-admin/pulls) though.

### I get an ENOENT when I go to localhost:3000

Did you run `bin/kinto-admin` from this repository?

You can only run `kinto-admin` if you get `kinto-admin` with npm. The
version of `kinto-admin` uploaded to npm contains an
automatically-built `dist` directory with the artifacts that the
browser needs.

Instead, run the development server, as above.

### How to display a nested field value using the collection displayFields property?

Use the *dot* notation.

For example, if you have the following record:

```
{
  "data": {
    "attachement": {
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
