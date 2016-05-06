# Kinto Web Administration Console

[![Build Status](https://travis-ci.org/Kinto/kinto-admin.svg)](https://travis-ci.org/Kinto/kinto-admin)

A Web admin UI to manage [Kinto](https://kinto.readthedocs.io/) collections.
[Give it a go](http://kinto.github.io/kinto-admin/)!

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

The Web admin UI can be served locally using the `kinto-admin` executable,
provided you pass it a valid JSON configuration file:

```bash
$ kinto-admin serve --config myconfig.json
Using config at myconfig.json
Listening at http://0.0.0.0:3000
```

You can specify the port to listen to using the `--port` or `-p` options:

```bash
$ kinto-admin serve --config myconfig.json -p 4000
Using config at myconfig.json
Listening at http://0.0.0.0:4000
```

## Configuration

The required JSON configuration lists the collections to manage through the Web
UI as well as their own individual configuration:

```js
// config.json
{
  // Optional: The default Kinto server settings to use
  "settings": {
    "server": "http://my.kinto.server.tld/v1",
    "bucket": "mybucketname",
    "username": "myusername",
    "password": "mypassword"
  },
  // Required: The collection definitions
  "collections": {
    // The name of a collection to manage
    "tasks": {
      // Human readable name
      "name": "Todo tasks",
      // Collection configuration object
      "config": {
        // The fields to render in list view
        "displayFields": ["title", "done"],
        // Live forms validation
        "liveValidate": false,
        // The JSON schema for this collection
        "schema": {
          "title": "Todo Tasks",
          ...
        }
      }
    },
    // Another collection to manage
    "articles": {
      // ...
    }
  }
}
```

*Note: The [JSONSchema](http://jsonschema.net/) provided for a collection must
match the records stored in the target Kinto server instance. You can generate
your JSON schemas online [here](http://jsonschema.net/).*

## Building static assets for production hosting

```
$ kinto-admin build -c config.json -d static-build
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

The development server should only be used when working on the kinto-admin
codebase itself:

```
$ npm start
```

The application is served at [localhost:3000](http://localhost:3000/), and any
React component update will trigger a hot reload.

## License

Apache Licence Version 2.0
