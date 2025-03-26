import os
import requests
import openai

# Configurações
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
REPO_OWNER = "Nunderns"
REPO_NAME = "kanban_tcc"

# Obter número da Pull Request
PR_NUMBER = os.getenv("GITHUB_EVENT_PATH")
if PR_NUMBER:
    import json
    with open(PR_NUMBER) as f:
        event_data = json.load(f)
    PR_NUMBER = event_data["pull_request"]["number"]

# Obter alterações na Pull Request
headers = {"Authorization": f"Bearer {GITHUB_TOKEN}"}
url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls/{PR_NUMBER}/files"
response = requests.get(url, headers=headers)
files = response.json()

code_changes = ""
for file in files:
    filename = file["filename"]
    patch = file.get("patch", "")
    code_changes += f"Arquivo: {filename}\n{patch}\n\n"

# Enviar código para análise da OpenAI
openai.api_key = OPENAI_API_KEY
prompt = f"Revise as seguintes mudanças de código e sugira melhorias:\n\n{code_changes}"

response = openai.ChatCompletion.create(
    model="gpt-4-turbo",
    messages=[{"role": "system", "content": "Você é um revisor de código experiente."},
              {"role": "user", "content": prompt}]
)

review_feedback = response["choices"][0]["message"]["content"]

# Comentar na Pull Request
comment_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues/{PR_NUMBER}/comments"
comment_data = {"body": f"### Feedback Automático:\n\n{review_feedback}"}
requests.post(comment_url, json=comment_data, headers=headers)

# Aprovar a PR se for um bom código
if "parece estar bom" in review_feedback.lower():
    approve_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/pulls/{PR_NUMBER}/reviews"
    approve_data = {"event": "APPROVE", "body": "Aprovação automática pelo bot."}
    requests.post(approve_url, json=approve_data, headers=headers)
