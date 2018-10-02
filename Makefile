lint: build
	./node_modules/.bin/require-lint && \
	./node_modules/.bin/eslint index.js 'src/**/*.js' 'test/**/*.js'

test: lint
	rm -rf coverage
	@NODE_ENV=test ./node_modules/.bin/nyc ./node_modules/.bin/mocha test
	./node_modules/.bin/nyc report --reporter=text --reporter=text-summary

coverage-report:
	./node_modules/.bin/nyc report --reporter=text-lcov | ./node_modules/.bin/coveralls

build:
	rm -rf target
	@BABEL_ENV=node6 ./node_modules/.bin/babel src --out-dir target/node6
	@BABEL_ENV=node8 ./node_modules/.bin/babel src --out-dir target/node8
	@BABEL_ENV=node10 ./node_modules/.bin/babel src --out-dir target/node10

.PHONY: lint, test, coverage-report, build
