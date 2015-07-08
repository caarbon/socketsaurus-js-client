# Socketsaurus Client (JS) [![Circle CI](https://circleci.com/gh/caarbon/socketsaurus-js-client.svg?style=svg)](https://circleci.com/gh/caarbon/socketsaurus-js-client)

![Hello World](./readme_images/rawr.gif)

## NPM

```
npm install socketsaurus_js_client
```

## Usage

First call Socketsaurus with a base URI you will be connecting to.
It will return a function which you can use to listen to various collections.

```js
var socket = socketsaurus('http://localhost:3000');
```

If you need to pass handshake attributes (for auth) you can do so here.

```js
var socket = socketsaurus('http://localhost:3000', {
  token: 'a5079cc66918f780d51ce0035ebe24d9',
  signature: '810d917029606be28cb30ab8f00e6202'
});
```

### Events

You can now create some references to collections in MongoDb.

```js
var ref = socket('customers');

ref.on('error', function(err) {
  console.log(err);
});

// recieves entire document
ref.on('created', function(doc) {
  console.log(doc);
});

// doc only has _id
ref.on('removed', function(doc) {
  console.log(doc._id);
});

// document contains modified attributes
ref.on('modified', function(doc) {
  console.log(doc);
});

// `doc` is the document containing modifications
// `mod` is just the portion of the document that was modified
ref.on('modification', function(data) {
  console.log(data.doc);
  console.log(data.mod);
});

// only listens to 'created' once
ref.once('created', function(doc) {
  console.log(doc);
});
```

### Additional Methods

You can take any reference and drill into any attribute.
This will result in a _new_ reference object.

```js
var carsRef = socket('cars');                 // listening to cars

var locationRef = carsRef.child('location');  // listening to cars.location

var latRef = locationRef.child('lat');        // listening to cars.location.lat

var latRef2 = carsRef.child('location.lat');  // same result as `latRef` - cars.location.lat
```

You can also move back to root.
This will result in a _new_ reference object.

```js
var latRef = socket('cars.location.lat');     // listening to cars.location.lat

var carsRef = latRef.root();                  // listening to cars
```

If you need to filter inbound events, then you can add conditionals to check against.

```js
userRef.conditionals({
  first_name: 'tim',
  state: {
    online: true
  }
});

// appends conditionals to existing
userRef.conditionals({
  last_name: 'marshall'
});

// clears all conditionals
userRef.clearConditionals();
```

## Lint

To lint the code, first `npm install` the dev dependencies, and then run `grunt lint`.
