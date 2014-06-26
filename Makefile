REPORTER ?= dot

PORT = 8081

build: node_modules test
	@./node_modules/.bin/component build

test: node_modules lint build-dev
	@./node_modules/.bin/mocha-phantomjs http://127.0.0.1:$(PORT) \
		--reporter $(REPORTER)

lint: node_modules ./lib/*.js
	@./node_modules/.bin/jshint

build-dev: node_modules
	@./node_modules/.bin/component build \
		--dev \
		--out ./test/ \
		--name main

serve: node_modules ./test/server.js
	node $^

node_modules:
	@npm install

clean:
	@rm -fr build components node_modules
	@rm test/main.js

.PHONY: build test lint build-dev serve clean
