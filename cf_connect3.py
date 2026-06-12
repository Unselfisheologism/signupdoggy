import subprocess, json, re

ACCOUNT = "107604041df5273090d9dbaa9f3dc796"

# Read token from wrangler config
with open("C:/Users/HP/AppData/Roaming/xdg.config/.wrangler/config/default.toml") as f:
    config = f.read()
match = re.search(r'oauth_token = "([^"]+)"', config)
TOKEN = match.group(1)
AUTH = f"Authorization: Bearer {TOKEN}"
CT = "Content-Type: application/json"

# Check operit-landing's git config
r = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/operit-landing",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)

d = json.loads(r.stdout)
src = d.get("result", {}).get("source", {})
print("Operit landing source:")
print(json.dumps(src, indent=2))

# Try creating a new project with git integration
# But first need to know which GitHub repos are accessible
r2 = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/sources/github",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
print("\nGitHub sources:")
print(r2.stdout[:500])
