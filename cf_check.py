import subprocess, json, re

ACCOUNT = "107604041df5273090d9dbaa9f3dc796"

with open("C:/Users/HP/AppData/Roaming/xdg.config/.wrangler/config/default.toml") as f:
    config = f.read()
match = re.search(r'oauth_token = "([^"]+)"', config)
TOKEN = match.group(1)
AUTH = "Authorization: Bearer XXX"
CT = "Content-Type: application/json"

# Replace placeholder with actual token
AUTH = AUTH.replace("XXX", TOKEN)

# Check deployments
r = subprocess.run(["curl", "-s",
    "https://api.cloudflare.com/client/v4/accounts/&lt;acct&gt;/pages/projects/signupdoggy/deployments".replace("&lt;acct&gt;", ACCOUNT),
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
d = json.loads(r.stdout)
deployments = d.get("result", [])
if deployments:
    latest = deployments[0]
    print("Latest deployment: " + str(latest.get("id")))
    print("Environment: " + str(latest.get("environment")))
    stage = latest.get("latest_stage", {})
    print("Status: " + str(stage.get("status")))
    print("Created: " + str(latest.get("created_on")))
    trigger = latest.get("deployment_trigger", {})
    print("Trigger type: " + str(trigger.get("type")))
    md = trigger.get("metadata", {})
    print("Branch: " + str(md.get("branch")))
    h = md.get("commit_hash", "") or ""
    print("Commit: " + h[:12])
    print("Msg: " + str(md.get("commit_message")))
else:
    print("No deployments yet")
    print(json.dumps(d, indent=2)[:300])

# Check project info
r2 = subprocess.run(["curl", "-s",
    "https://api.cloudflare.com/client/v4/accounts/&lt;acct&gt;/pages/projects/signupdoggy".replace("&lt;acct&gt;", ACCOUNT),
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
d2 = json.loads(r2.stdout)
r = d2.get("result", {})
src = r.get("source", {})
print("\nProject: " + str(r.get("name")))
print("Source: " + str(src.get("type")))
print("Subdomain: " + str(r.get("subdomain")))
