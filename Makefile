NODE_BIN=./node_modules/.bin


test:
	${NODE_BIN}/istanbul cover ${NODE_BIN}/_mocha test


test-nocov:
	${NODE_BIN}/mocha test


.PHONY: test test-nocov
