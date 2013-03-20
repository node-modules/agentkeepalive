TESTS = test/*.js
REPORTER = spec
TIMEOUT = 20000
JSCOVERAGE = ./node_modules/jscover/bin/jscover

test:
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-cov:
	@rm -rf ./lib-cov coverage.html
	@$(JSCOVERAGE) lib lib-cov
	@AGENT_KEEPALIVE_COV=1 $(MAKE) test REPORTER=dot
	@AGENT_KEEPALIVE_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

.PHONY: test test-cov