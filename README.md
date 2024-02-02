# Kinto Web Administration Console

[![Build Status](https://img.shields.io/github/workflow/status/Kinto/kinto-admin/CI/master)](https://github.com/Kinto/kinto-admin/actions)

A Web admin UI to manage data from a [Kinto](https://kinto.readthedocs.io/) server. [Demo](https://kinto.github.io/kinto-admin/).

`kinto-admin` wants to be the [pgAdmin](https://www.pgadmin.org/) for
Kinto. You can also use it to build administration interfaces for
Kinto-based systems.

## Table of Contents

  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
     - [Prebuilt Single Server Assets](#prebuilt-single-server-assets)
     - [Building the Assets](#building-the-assets)
        - [Latest Release](#latest-release)
        - [Earlier Release](#earlier-release)
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
     - [Through GitHub UI](#through-github-ui)
     - [Through git commands](#through-git-commands)
  - [Deploying to github-pages](#deploying-to-github-pages)
     - [Repo configuration for forks](#repo-configuration-for-forks)
     - [Deployed automatically on release publish](#deployed-automatically-on-release-publish)
     - [Running the github action manually](#running-the-github-action-manually)
  - [License](#license)

---

## Prerequisites

NodeJS v16+ and npm 8+ should be installed and available on your machine.

Various pre-commit hooks are available to help prevent you from
pushing sub-optimal code; to use these, ``pip install --user
pre-commit`` and ``pre-commit install``. (If you have a
``.git/hooks/pre-commit.legacy``, you can remove it.)

## Installation

### Prebuilt Single Server Assets
If you intend to use Kinto Admin in a Kinto Server with standard options, since [version v3.0.3](https://github.com/Kinto/kinto-admin/releases/tag/v3.0.3), you can download prebuilt assets for each release. 

### Building the Assets
To customize your Kinto Admin installation, you can download the source code and build the asset bundle. Then, you can serve the bundle from your server of choice. See [below](#build-customization) for customization options.

#### Latest Release
- download the latest [release](https://github.com/Kinto/kinto-admin/releases/latest) from Github.

- Unzip the directory, then install dependencies:
```bash 
cd kinto-admin && npm ci
```

- Build the static bundle with:

```bash
npm run build
```

#### Earlier Release
To download an earlier release, set a `KINTO_ADMIN_VERSION` environment variable with the tag you're downloading. For example:

```bash
export KINTO_ADMIN_VERSION="v1.2.3"

curl -OL "https://github.com/Kinto/kinto-admin/archive/refs/tags/${KINTO_ADMIN_VERSION}.tar.gz"
# ...
npm ci
npm run build
```

This will inject the version into the built asset bundle.


## Build customization
Use the following options to customize the Kinto Admin build.

### Single Server
By default, Kinto Admin gives you the option to connect to multiple Kinto Servers. If you only want Kinto Admin to connect to the server from which it's being served, you can set the `KINTO_ADMIN_SINGLE_SERVER` flag as an environment variable:

```
KINTO_ADMIN_SINGLE_SERVER=1 npm run build
```

### Building for relative paths
By default, Kinto Admin assumes assets will be served from the root path (`/`) of the server. If you'd like to serve assets from a different location, set that option with the `ASSET_PATH` environment variable:

```
$ ASSET_PATH="/some/prefix/" npm run build
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

Optionally, configure `git` to use `.git-blame-ignore-revs` to remove noisy commits (e.g. running `prettier` on the entire codebase) from `git blame`:

```
$ git config blame.ignoreRevsFile .git-blame-ignore-revs
```

After installation of packages, run the development server.
```
$ npm run start
```

## Development server

The development server should only be used when working on the
`kinto-admin` codebase itself. If you're evaluating Kinto Admin, or
building a system that relies on Kinto Admin to administer, you should
install Kinto Admin using the installation instructions above.

To run in development mode:

```
$ npm run start
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
Releases can be created through the GitHub UI or through git command line.

### Through GitHub UI
1. Create a new release as normal
2. When tagging your release, enter a standard version number like `vX.Y.Z`
3. After the release is published (including pre-release), built assets will be attached as files, including:
    1. Source code based on the tagged commit
    2. A single-server build for kinto-admin in a tar file (this may take a few minutes to show up)

### Through git commands
1. Tag a commit with `git tag --annotate vX.Y.Z` (this will become the version number in the built release)
2. Push the tag with `git push origin vX.Y.Z` or `git push origin --tags`
3. A new release draft will be created automatically with built assets attached as files, including:
    1. Source code based on the tagged commit
    2. A single-server build for kinto-admin in a tar file
        1. This will have `ASSET_PATH=/v1/admin KINTO_ADMIN_SINGLE_SERVER=1` build property values
        2. This may take a few minutes to show up
4. Update the release body with detailed information
5. Publish the release when ready

## Deploying to github-pages

### Repo configuration for forks
1. Enable github pages and allow deployment from github actions 
    1. Go Settings > Pages
    2. Under "Build and deployment" choose Source > GitHub Actions
2. Choose which branches should be allowed to deploy to pages
    1. Go Settings > Environments > Github Pages
    2. Under "Deployment branches and tags", configure which branches should be allowed to deploy to pages

### Deployed automatically on release publish
Github pages will automatically be updated upon release publishing. Version will be the tag created

### Running the github action manually
You can deploy to github pages manually for To deploy to github pages manually for any user acceptance testing you may want to do.
1. Open Actions
2. Select the "Deploy to Github Pages" action
3. Select "Run workflow" and choose the branch you wish to build against
4. Click "Run workflow"
5. Kinto-admin will be deployed to `https://{owner}.github.io/kinto-admin`


## License

Apache Licence Version 2.0
