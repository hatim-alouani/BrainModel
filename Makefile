YELLOW=\033[1;33m
GREEN=\033[0;32m
RED=\033[0;31m
NC=\033[0m

all: 
	@if [ ! -d "myenv" ]; then \
		echo -e "$(YELLOW)[+] Creating virtual environment...$(NC)"; \
		python3 -m venv myenv && \
		echo -e "$(GREEN)[✔] Virtual environment created!$(NC)"; \
	fi
	@echo -e "$(YELLOW)[+] Installing dependencies...$(NC)"
	@myenv/bin/pip install -r requirements.txt
	@echo -e "$(GREEN)[✔] Dependencies installed!$(NC)"

clean:
	@echo -e "$(YELLOW)[+] Removing virtual environment...$(NC)"
	@rm -rf myenv
	@echo -e "$(GREEN)[✔] Virtual environment removed!$(NC)"