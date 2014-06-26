
# Request [![Build Status](https://travis-ci.org/decanat/request.svg?branch=master)](https://travis-ci.org/decanat/request)

XHR wrapper, with Node-style callbacks.

```js
var Request = require('decanat-request');
// instantiate
var request = new Request('post', 'http://example.com/');

request
    .data({ firstname: 'Anna', lastname: 'Sedokova' })
    .send(callback);

function callback(err, data, status) {
    if (err) throw err;
    //    
}
```

## Installation

  Install with [component](http://component.io):

    $ component install decanat/request

  Install with [npm](https://www.npmjs.org/):

    $ npm install decanat-request

## API

#### Headers ####

```js
req.header('X-CSRF-Token', 't0ken');
req.header({ 'X-Hello': 'Moto' });

req.headers; // { 'x-csrf-token': 't0ken', 'x-hello': 'moto', ... }
```

#### Data ####

```js
var req = Request('post', 'http://example.com/bangs');

req
    .data('She', 'looks')
    .data('like=no%20one&in=history')
    .data({ 'She': 'stings', 'like': 'every girl' });

req.body; // '{"She":"stings","like":"every girl","in":"history"}'
```

Body will be attached to querystring on `GET` and `HEAD` requests. So if previous request was initialized with `'get'` as method, we'd have:

```js
req.body; // null
req.url; // 'http://example.com/bangs?She=stings&like=every%20girl&in=history'
```

#### Callbacks ####

Callback function can be supplied as argument, when calling `.send` method:

```js
req.send(function(err, res, data){
    if (err) throw err;
    // body..
});
```

Or using `.complete`, which saves callback to be invoked when XHR request will be loaded, or immediately, if it's alread loaded.

```js
// `fn1`, `fn2`, .. are callback functions
req
    .complete(fn1)
    .complete(fn2);

req.send(fn3);

```

## Testing

To test with PhantomJS, run:

    $ make serve &
    $ make test

## Forebears

  - <https://github.com/visionmedia/superagent>
  - <https://github.com/mikeal/request>

## License

  The MIT License (MIT)

