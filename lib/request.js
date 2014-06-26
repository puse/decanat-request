/**
 * Dependencies.
 */

var type    = require('component-type');

var compact = require('yiwn-compact'),
    prop    = require('yiwn-prop');

var qs      = require('decanat-querystring'),
    url     = require('decanat-url');

var Response = require('./response.js');

/**
 * Expose `Request`.
 */

module.exports = Request;

/**
 * Expose `Response`
 */

module.exports.Response = Response;

/**
 * Map for 'Content-type' header, based on `type`.
 */

var typeMap = {
        'json': 'application/json',
        'text': 'text/plain',
        'html': 'text/html'
    };

/**
 * Constructor for request.
 *
 * @constructor
 * @param {String} method
 * @param {String} urlStr
 * @return {Request}
 * @api public
 */

function Request(method, urlStr) {
    if (!(this instanceof Request))
        return new Request(method, urlStr);

    initialize.call(this, method, urlStr);

    return this;
}

/**
 * Initialize with defaults and call setup function.
 *
 * @param  {String} method [optional]
 * @param  {String} urlStr
 * @return {Request}
 * @api private
 */

function initialize(method, urlStr) {
    if (urlStr == void 0)
        urlStr = method, method = 'GET';

    if (!urlStr) throw new Error('No URL :(');

    this.callbacks = [];

    this._method  = method;
    this._url     = url.parse(urlStr, true);
    this._body    = {};
    this._headers = { 'x-requested-with': 'xmlhttprequest' };
    this._type    = 'json';

    configure(this);

    return this;
}

/**
 * Define custom getters.
 *
 * @param  {Request} req
 * @api private
 */
function configure(req) {
    Object.defineProperty(req, 'url', {
        get: function() {
            return url.format(this._url);
        }
    });

    Object.defineProperty(req, 'body', {
        get: function() {
            var data = this._body;

            // avoid sending `''` or `{}`
            if (!Object.keys(data).length)
                return null;

            return this._form
                ? qs.stringify(data)
                : JSON.stringify(data);
        }
    });

    Object.defineProperty(req, 'headers', {
        get: function() {
            var headers = Object.create(this._headers);

            headers['content-type'] = typeMap[this._type] || 'text/plain';

            return compact(headers);
        }
    });

    Object.defineProperty(req, 'method', {
        get: function() {
            return this._method
                ? this._method.toUpperCase()
                : 'GET';
        }
    });
}



/**
 * Set headers.
 *
 * @param  {String|Object} name
 * @param  {String} value [optional]
 * @return {Request}
 * @api public
 */

Request.prototype.header = function(header, value) {
    // to store lowercase
    if (type(header) == 'object') {
        for (var name in header)
            this.header(name, header[name]);
        return this;
    }

    // var headers = this._headers, name;
    header = header.toLowerCase();

    if (typeof value == 'string')
        value = value.toLowerCase();

    prop(this._headers, header, value);

    return this;
};


/**
 * Set data to send.
 *
 * @param  {String|Object} name
 * @param  {String} value [optional]
 * @return {Request}
 * @api public
 */

Request.prototype.data = function(name, value) {
    var reVerb = /^(GET|HEAD)$/i;

    var store = reVerb.test(this._method)
            ? this._url.query
            : this._body;

    if (typeof name == 'string' && name.indexOf('=') !== -1)
        name = qs.parse(name);

    prop(store, name, value);

    return this;
};


/**
 * Define request type.
 *
 * @param  {String} responseType
 * @return {Request}
 * @api public
 */

Request.prototype.type = function(responseType) {
    if (arguments.length === 0)
        return this._type;

    this._type = responseType;

    return this;
};


/**
 * Enable `form` flag.
 *
 * @param  {Boolean} form
 * @return {Request}
 */

Request.prototype.form = function(form) {
    this._form = form !== false;
    return this;
};


/**
 * Send request, with optional callback.
 * If request already sent, just invoke callback.
 *
 * @param  {Function} done [optional]
 * @return {Request}
 * @api public
 */

Request.prototype.send = function(done) {
    if (type(done) == 'function')
        this.complete(done);

    // avoid re-sending
    if (this.sent)
        return this;

    this.sent = true;

    var xhr = this.xhr = new XMLHttpRequest(),
        res = this.res = Response(this, xhr);

    inspect(this, res);

    if (this.type() === 'json') {
        res.json = true;

        try {
            xhr.responseType = 'json';
        }
        catch (err) {
            // jsonc for "json competent"
            res.jsonc = false;
        }
    }

    xhr.open(this.method, this.url, true);

    for (var header in this.headers)
        xhr.setRequestHeader(header, this.headers[header]);

    try {
        xhr.send(this.body);
    }
    catch (err) {
        res.fail(err);
    }

    return this;
};


/**
 * Watch XHR events.
 *
 * @param  {Request} req
 * @param  {Response} res
 * @api private
 */

function inspect(req, res) {
    var xhr = req.xhr;

    xhr.onreadystatechange = function(){
        req.state = xhr.readyState;
    };

    xhr.addEventListener('load', function(){
        res.load();
    }, false);

    xhr.addEventListener('error', function(){
        res.load(true);
    }, false);
}


/**
 * Fire callback functions and flag Request as ended.
 *
 * @param  {Miscue|Null} err
 * @param  {Response} res [optional]
 * @param  {Object|String} data [optional]
 * @return {Request}
 * @api private
 */

Request.prototype.end = function(err, res, data){
    this.ended = true;

    var fns = this.callbacks, fn;

    while (fn = fns.shift())
        fn.call(this, err, res, data);

    return this;
};


/**
 * Add callback function.
 * Invoke immediately if request is "ended" already.
 *
 * @param  {Function} fn
 * @return {Request}
 * @api public
 */

Request.prototype.complete = function(fn){
    if (!this.ended) {
        this.callbacks.push(fn);
        return this;
    }

    var res = this.res;

    fn.call(this, res.error, res, res.data);

    return this;
};


/**
 * Transform to nice string.
 *
 * @return {String}
 * @api public
 */

Request.prototype.toString = function() {
    return this.method + ' ' + this.url;
};
