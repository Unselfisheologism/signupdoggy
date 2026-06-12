import subprocess, json, re

ACCOUNT = "107604041df5273090d9dbaa9f3dc796"

with open("C:/Users/HP/AppData/Roaming/xdg.config/.wrangler/config/default.toml") as f:
    config = f.read()
match = re.search(r'oauth_token = "([^"]+)"', config)
TOKEN=match....AUTH = "Authorization: Bearer *** = "Content-Type: application/json"
AUTH = AUTH.replace("XXX", TOKEN)

# Get full project info to see connection status
r = subprocess.run(["curl", "-s",
    "https://api.cloudflare.com/client/v4/accounts/&lt;acct&gt;/pages/projects/signupdoggy".replace("&lt;acct&gt;", ACCOUNT),
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
d = json.loads(r.stdout)
print(json.dumps(d.get("result", {}), indent=2)[:1000])
