var Request = require('request'),
    Response = Request.Response;


describe('Request', function(){
    var req, attrs;

    beforeEach(function(){
        req = Request('http://google.com/test');
    });

    describe('Itself', function () {
        it('should throw an error if instantiated without arguments', function(){
            expect(create).to.throw(Error);

            function create(){
                return Request();
            }
        });
    });

    describe('#method', function(){
        it('should default to GET', function(){
            expect(req.method)
                .to.equal('GET');
        });

        it('should be stored uppercase', function(){
            var req = Request('post', 'http://google.com');

            expect(req.method)
                .to.equal('POST');
        });
    });

    describe('#url', function(){
        it('should prepend origin of document to url if does not contain already', function(){
            var req1 = Request('GET', 'test/'),
                req2 = Request('GET', 'http://google.com');

            var origin = window.location.origin;

            expect(req1.url)
                .to.equal(origin + '/test/');
            expect(req2.url)
                .to.equal('http://google.com/');
        });

        it('should return full url string', function(){
            var req = Request('http://brides.com/slavic/search?page=4&hair=red');

            expect(req.url)
                .to.deep.equal('http://brides.com/slavic/search?page=4&hair=red');
        });

        it('should merge query string params on multi-input on GET/HEAD`', function(){
            var req = new Request('http://brides.com/slavic/search?page=4&hair=red');

            req.data('page=5&eyes=blue')
                .data({
                    hair: 'blonde',
                    dimples: true
                });

            expect(req.url)
                .to.have.string('page=5')
                .to.have.string('eyes=blue')
                .to.have.string('hair=blonde')
                .to.have.string('dimples=true');

            expect(req.url)
                .to.not.have.string('page=4')
                .to.not.have.string('haid=red');
        });
    });

    describe('#headers', function() {
        it('should have default headers', function(){
            expect(req.headers)
                .to.have.property('x-requested-with', 'xmlhttprequest');
        });

        it('should set headers as string and object', function(){
            req.header('X-Random-Header', 'Header-Content');

            expect(req.headers)
                .to.have.property('x-random-header', 'header-content');

            req.header({ 'x-another-header': 'another-content'});

            expect(req.headers)
                .to.have.property('x-another-header', 'another-content');
        });

        it('should return special header or all, if no name specified', function(){
            req.header('X-Random-Header', 'Header-Content');

            expect(req.headers)
                .to.be.an('object')
                .to.have.property('x-random-header', 'header-content');
        });

        it('should delete headers with `null` as value', function(){
            req.header('X-Requested-With', null);

            expect(req.headers)
                .to.not.have.property('x-requested-with');
        });

    });

    describe('#data', function(){
        it('should store data to `.body`', function(){
            req = Request('post', 'http://google.com');

            req.data('some', 'data')
                .data('some=lights&no=music')
                .data({ just: 'anger' });

            expect(req.body)
                .to.equal(JSON.stringify({
                    some: 'lights',
                    no: 'music',
                    just: 'anger'
                }));
        });

        it('should serialize data to JSON by default, and to qs, if `form` enabled', function(){
            req = Request('post', 'http://google.com');

            req.data('page=1&q=movies')
                .data({ page: 2 });

            expect(req.body)
                .to.equal(JSON.stringify({ page: 2, q: 'movies' }));

            req.form();

            expect(req.body)
                .to.equal('page=2&q=movies');
        });
    });

    describe('#type', function(){
        it('should have default type of JSON', function(){
            expect(req.type())
                .to.equal('json');

            expect(req.headers['content-type'])
                .to.equal('application/json');
        });

        it('should change content-type header on type change, setting "text/plain" if unknown', function(){
            req.type('text');

            expect(req.headers['content-type'])
                .to.equal('text/plain');

            req.type('html');

            expect(req.headers['content-type'])
                .to.equal('text/html');

            req.type('atom+xml');

            expect(req.headers['content-type'])
                .to.equal('text/plain');
        });
    });

    describe('#send', function(){
        it('should evaluate callback on success', function(done){
            req = Request('127.0.0.1:8081/test');
            req.send(callback);

            function callback() { done(); }
        });
    });

    describe('Etc.', function(){
        it('should turn `_form` flag', function(){
            expect(req._form)
                .to.not.be.ok;

            req.form();
            expect(req._form)
                .to.be.ok;

            req.form(false);
            expect(req._form)
                .to.not.be.ok;
        });

        it('should become a nice string', function(){
            expect(req + '')
                .to.equal('GET http://google.com/test');
        });
    });
});


describe('Response', function(){
    var req, res, xhr;

    beforeEach(function(){
        req = Request('http://127.0.0.1:8081/test');
        xhr = new XMLHttpRequest();
        res = Response(req, xhr);
    });

    describe('Parsing', function(){
        it('should parse headers', function(done){
            req.send(callback);

            function callback (err, res, data) {
                expect(res.headers)
                    .to.be.an('object')
                    .to.have.property('x-test-header', 'Header-Content');

                done();
            }
        });

        it('should parse json body', function(done){
            req.send(callback);

            function callback (err, res, data) {
                expect(data)
                    .to.be.an('object')
                    .to.have.property('test', 'passed');

                done();
            }
        });

        it('should return text if requested', function(done) {
            var req = Request('http://127.0.0.1:8081/testtext');

            req.complete(function(err, res, data){
                callback(err, res, data);
                done();
            });

            req.type('text')
                .send();

            function callback (err, res, data) {
                expect(data)
                    .to.be.a('string')
                    .to.equal('test passed');
            }
        });

        it('should parse error data', function(done){
            var req = new Request('http://127.0.0.1:8081/test422');

            req.complete(function(err){
                callback(err);
                done();
            });

            req.send(callback);

            function callback (err, res, data) {
                expect(err)
                    .to.exist;

                expect(err.code)
                    .to.equal(422);

                expect(err.data)
                    .to.deep.equal({ email: 'invalid' });
            }
        });
    });

});
