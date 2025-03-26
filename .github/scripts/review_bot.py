import os
import requests

# Configurações do GitHub
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO_OWNER = "Nunderns"  # Seu usuário no GitHub
REPO_NAME = "kanban_tcc"  # Seu repositório
PR_NUMBER = os.getenv("GITHUB_REF").split("/")[-1]  # Número da PR

# Headers para autenticação na API do GitHub
HEADERS = {"Authorization": f"Bearer {GITHUB_TOKEN}", "Accept": "application/vnd.github.v3+json"}

# Função para comentar na Pull Request
def comment_on_pr(comment):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues/{PR_NUMBER}/comments"
    data = {"body": comment}
    requests.post(url, json=data, headers=HEADERS)

# Função para aprovar a Pull Request
def approve_pr():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls/{PR_NUMBER}/reviews"
    data = {"event": "APPROVE", "body": "Aprovação automática pelo bot."}
    requests.post(url, json=data, headers=HEADERS)

# Função para fazer merge da PR
def merge_pr():
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls/{PR_NUMBER}/merge"
    data = {"commit_title": "Merge aprovado pelo bot"}
    requests.put(url, json=data, headers=HEADERS)

# Verificar resultado da análise de código
if os.path.exists("flake8_report.txt"):
    with open("flake8_report.txt") as f:
        report = f.read()

    if "E" in report or "F" in report:  # Erros críticos do flake8
        comment_on_pr("Erros encontrados no código. PR não aprovada.")
    else:
        approve_pr()
        merge_pr()
        comment_on_pr("PR aprovada e mesclada automaticamente!")
