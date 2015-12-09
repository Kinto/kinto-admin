# Kinto Web Administration Console

[![Build Status](https://travis-ci.org/Kinto/kinto-admin.svg)](https://travis-ci.org/Kinto/kinto-admin)

A Web admin UI to manage Kinto collections.

## Installation

NodeJS v4+ and npm 2.14+ should be instaled and available on your machine.

```bash
$ npm install
```

## Development server

```
$ npm start
```

Application is served at [localhost:3000](http://localhost:3000/).
Any project file update will trigger an automatic reload.

## Building for production hosting

```
$ npm run build
```

Production-ready assets are generated in the `build/` directory, and
can be published on any static webserver.

## Publishing on github pages

```
$ npm run publish
```

Application is built and [published to gh-pages](http://kinto.github.io/kinto-admin/).

## License

Mozilla Public License 2.0
