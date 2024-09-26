# Element component starter

This is an element for [weweb.io](https://www.weweb.io/).

## Installation

To run locally, first install all dependencies with `npm i`

## Start

To serve locally, run `npm run serve --port=[PORT]`, and then go to Weweb editor, open developper popup and add your custom element.

## Build

Before release, you can check build error by running `npm run build --name=my-element`

## Releases

### 0.0.1

Initial release: POC

## Features

1. UI concept for appointment using naive UI
    - datepicker: disabled based on timeMin and timeMax
    - divider
    - time selector: generate based on working hours

### 0.0.2

Huge refactoring timeMin and timeMax also other new feature

## Features

1. refactor timeMin and timeMax logic using date-fns
2. refactor time list so that every hours is listed
3. add new props:
    - duration: default 30 minutes type number with 10 minutes step.
    - startTime & endTime: for available working hours
    - busyTime: list of busy time that will determine disabled/hidden time list
    - hideBusyTime: condition to hide or show disabled time.
4. event emit: emit data on select time.

### 0.0.3

Refactor: event ommited to dateTime attribute inside object.
