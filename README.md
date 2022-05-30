# <img src="https://uploads-ssl.webflow.com/5ea5d3315186cf5ec60c3ee4/5edf1c94ce4c859f2b188094_logo.svg" alt="Pip.Services Logo" width="200"> <br/> Asynchronous Messaging for Pip.Services in Node.js / ES2017ß

This module is a part of the [Pip.Services](http://pipservices.org) polyglot microservices toolkit.

The Messaging module contains a set of interfaces and classes for working with message queues, as well as an in-memory message queue implementation. 

The module contains the following packages:

- **Build** - in-memory message queue factory
- **Queues** - contains interfaces for working with message queues, subscriptions for receiving messages from the queue, and an in-memory message queue implementation.

<a name="links"></a> Quick links:

* [Configuration](http://docs.pipservices.org/toolkit/getting_started/configurations/)
* [API Reference](https://pip-services3-nodex.github.io/pip-services3-messaging-nodex/globals.html)
* [Change Log](CHANGELOG.md)
* [Get Help](http://docs.pipservices.org/get_help/)
* [Contribute](http://docs.pipservices.org/contribute/)

## Use

Install the NPM package as
```bash
npm install pip-services3-messaging-nodex --save
```

## Develop

For development you shall install the following prerequisites:
* Node.js 8+
* Visual Studio Code or another IDE of your choice
* Docker
* Typescript

Install dependencies:
```bash
npm install
```

Compile the code:
```bash
tsc
```

Run automated tests:
```bash
npm test
```

Generate API documentation:
```bash
./docgen.ps1
```

Before committing changes run dockerized build and test as:
```bash
./build.ps1
./test.ps1
./clear.ps1
```

## Contacts

The Node.js version of Pip.Services is created and maintained by:
- **Volodymyr Tkachenko**
- **Sergey Seroukhov**

The documentation is written by:
- **Mark Makarychev**