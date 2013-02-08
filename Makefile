lint:
	@./node_modules/.bin/jshint --config .jshintrc index.js lib/plugin.js

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--bail

.PHONY: test