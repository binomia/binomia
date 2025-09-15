.PHONY: up down clean_node_modules

up:
	docker compose up

down: 
	docker compose down --rmi local

clean_node_modules:
	@echo "Removing node_modules..."
	@find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	@echo "Removing node_modules (done)"

	@echo "Installing package.json dependencies..."
	@yarn install
	@echo "Installing package.json dependencies (done)"

