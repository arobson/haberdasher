.PHONY: help clean build test coverage release

help: ## Display available targets
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

clean: ## Remove dist, coverage, and vitest cache
	rm -rf dist coverage .vitest

build: clean ## TypeScript compilation (runs clean first)
	npm run build

test: ## Run vitest tests
	npm test

coverage: ## Generate coverage report
	npm run coverage

release: test build ## Run tests, build, and create release
	@echo "Release artifacts ready in dist/"
	@echo "Run 'npm publish' to publish to npm"
