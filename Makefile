REPORTER ?= dot

PORT = 8081

build: test
	@./node_modules/.bin/component build

test: lint build-dev
	@./node_modules/.bin/mocha-phantomjs http://127.0.0.1:$(PORT) \
		--reporter $(REPORTER)

lint: ./lib/*.js
	@./node_modules/.bin/jshint

build-dev:
	@./node_modules/.bin/component build \
		--dev \
		--out ./test/ \
		--name main

serve: ./test/server.js
	node $^

clean:
	@rm -fr build components node_modules
	@rm test/main.js

.PHONY: build test lint build-dev serve clean
