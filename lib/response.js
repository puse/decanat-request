/**
 * Dependencies.
 */

var unserialize = require('yiwn-unserialize');

var Miscue  = require('decanat-miscue');

/**
 * Expose `Response`.
 */

module.exports = Response;


/**
 * Create a `Response` instance.
 *
 * @constructor
 * @param {Request} req
 * @param {XMLHttpRequest} xhr
 * @return {Response}
 * @api public
 */

function Response(req, xhr){
    if (!(this instanceof Response))
        return new Response(req, xhr);

    this.initialize(req, xhr);

    return this;
}

/**
 * Initialize with provided `Request` and `XHR` objects.
 * Saves links and defines properties.
 *
 * @param  {Request} req
 * @param  {XMLHttpRequest} xhr
 * @return {Response}
 * @api private
 */

Response.prototype.initialize = function(req, xhr) {
    this.req = req;
    this.xhr = xhr;

    Object.defineProperty(this, 'status', {
        get: function(){
            if (!this.ended)
                return 0;
            return xhr.status;
        }
    });

    Object.defineProperty(this, 'headers', {
        get: function() {
            if (xhr.readyState < 2)
                return null;

            // cache
            return this._headers = this._headers
                || parseHeaders(xhr);
        }
    });

    Object.defineProperty(this, 'data', {
        get: function() {
            if (!this.ended)
                return null;

            // check cache
            var data = this._data;

            // retreive and cache
            if (data == void 0)
                data = this._data = parse(xhr, this.json);

            return data;
        }
    });
};


/**
 * On load callback for all cases,
 * on error called with not-null first argument.
 *
 * @param  {Mixed} err [optional]
 * @api private
 */

Response.prototype.load = function(err){
    this.ended = true;

    var status = Miscue(this.status);

    this.name = status.name;

    if (err) status.turnError();

    if (! (status instanceof Error))
        return this.req.end(null, this, this.data);

    status.data = this.data;
    this.error = status;

    this.req.end(status);
};


/**
 * Parse data returned from server.
 * Try hard to parse as JSON when expected.
 *
 * @param  {XMLHttpRequest} xhr
 * @param  {Boolean} json [option]
 * @return {Mixed}
 * @api private
 */

function parse(xhr, json) {
    var data = null;

    if (!json)
        return xhr.responseText;

    try {
        data = xhr.response;
    }
    finally {
        // `try ..` block was succesful, return
        if (data != null && typeof data != 'string')
            return data;

        // try again to make it json
        try {
            data = unserialize(xhr.responseText);
        }
        catch (err) {
            return data;
        }
    }

    return data;
}


/**
 * Parse headers' string from server to key-value pairs.
 *
 * @param  {XMLHttpRequest} xhr
 * @return {Object}
 * @api private
 */

function parseHeaders(xhr) {
    var headers = {},
        text    = xhr.getAllResponseHeaders(),
        lines   = text.split(/\r?\n/);

    lines.pop(); // trailing CRLF

    lines.reduce(function(o, line){
        var parts = line.split(':');

        var name  = parts.shift().toLowerCase(),
            value = parts.join(':').trim();

        o[name] = value;

        return o;
    }, headers);

    headers['content-type'] = xhr.getResponseHeader('content-type');

    return headers;
}
