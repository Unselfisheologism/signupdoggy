import subprocess, json, re

ACCOUNT = "107604041df5273090d9dbaa9f3dc796"

with open("C:/Users/HP/AppData/Roaming/xdg.config/.wrangler/config/default.toml") as f:
    config = f.read()
match = re.search(r'oauth_token = "([^"]+)"', config)
TOKEN = match.group(1)
AUTH = f"Authorization: Bearer {TOKEN}"
CT = "Content-Type: application/json"

# First, delete the old signupdoggy project
print("=== Deleting old signupdoggy project ===")
r1 = subprocess.run(["curl", "-s", "-X", "DELETE",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects/signupdoggy",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
d1 = json.loads(r1.stdout)
print(f"Delete success: {d1.get('success')}")
if not d1.get("success"):
    print(f"Errors: {d1.get('errors')}")

# Create new project with git integration
print("\n=== Creating new signupdoggy project with GitHub ===")
body = {
    "name": "signupdoggy",
    "source": {
        "type": "github",
        "config": {
            "owner": "Unselfisheologism",
            "repo_name": "registerguardian",
            "production_branch": "main",
            "pr_comments_enabled": True,
            "deployments_enabled": True,
            "production_deployments_enabled": True,
            "preview_deployment_setting": "all",
            "preview_branch_includes": ["*"],
            "preview_branch_excludes": [],
            "path_includes": ["*"],
            "path_excludes": []
        }
    },
    "build_config": {
        "build_command": "npm run build",
        "destination_dir": "dist",
        "root_dir": "/app"
    },
    "deployment_configs": {
        "production": {
            "env_vars": {},
            "build_config": {
                "build_command": "npm run build",
                "destination_dir": "dist",
                "root_dir": "/app"
            }
        },
        "preview": {
            "env_vars": {},
            "build_config": {
                "build_command": "npm run build",
                "destination_dir": "dist",
                "root_dir": "/app"
            }
        }
    }
}

r2 = subprocess.run(["curl", "-s", "-X", "POST",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects",
    "-H", AUTH, "-H", CT, "-d", json.dumps(body)], capture_output=True, text=True)
d2 = json.loads(r2.stdout)
print(f"Create success: {d2.get('success')}")
if d2.get("success"):
    r = d2["result"]
    src = r.get("source", {})
    print(f"Connected: {src.get('type')}")
    print(f"Repo: {src.get('config', {}).get('owner')}/{src.get('config', {}).get('repo_name')}")
    print(f"Branch: {src.get('config', {}).get('production_branch')}")
    print(f"Subdomain: {r.get('subdomain')}")
else:
    for e in d2.get("errors", []):
        print(f"Error {e.get('code')}: {e.get('message')}")
    print(f"\nFull: {json.dumps(d2, indent=2)[:500]}")
