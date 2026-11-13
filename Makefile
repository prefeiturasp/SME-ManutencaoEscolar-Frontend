CONTAINER = app
COMPOSE_FILE = docker-compose-dev.yml
DC = docker compose -f $(COMPOSE_FILE)
EXEC = $(DC) exec $(CONTAINER)

.PHONY: help install build start lint test coverage up down clean

help: ## Mostra esta mensagem de ajuda com os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instala as dependências do projeto
	yarn install

build: ## Compila o projeto
	yarn build

lint: ## Executa o lint
	yarn lint
 
test: ## Executa os testes
	yarn test

coverage: ## Executa os testes com cobertura de código
	yarn vitest run --coverage

clean: ## Remove node_modules, .next e coverage
	rm -rf node_modules .next coverage


# ==========================================
# Comandos do Docker
# ==========================================
up:
	$(DC) up

down:
	$(DC) down
