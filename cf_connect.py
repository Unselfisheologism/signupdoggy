import subprocess, json

TOKEN = "cfoat_IvZgTTNeaaJ9ZNQgbhuIFVcR5MNqKFxD9qIf9tbkhdc.KkcrZAQcucz7JPsPqmrSUT4IDbq98uz3P0HZ0wCCs8g"
ACCOUNT = "107604041df5273090d9dbaa9f3dc796"
API = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}"
AUTH = f"Authorization: Bearer {TOKEN}"
CT = "Content-Type: application/json"

# Check current project config
r1 = subprocess.run(["curl", "-s", f"{API}/pages/projects/signupdoggy", "-H", AUTH, "-H", CT], capture_output=True, text=True)
d1 = json.loads(r1.stdout)
src = d1.get("result", {}).get("source")
print("Current source:", json.dumps(src, indent=2) if src else "NONE")
print()

# Try PATCH with GitHub source
body = {
    "source": {
        "type": "github",
        "config": {
            "owner": "Unselfisheologism",
            "repo": "registerguardian",
            "production_branch": "main"
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

r2 = subprocess.run(["curl", "-s", "-X", "PATCH", f"{API}/pages/projects/signupdoggy",
    "-H", AUTH, "-H", CT, "-d", json.dumps(body)], capture_output=True, text=True)

d2 = json.loads(r2.stdout)
print(f"PATCH success: {d2.get('success')}")
if d2.get("success"):
    r = d2["result"]
    s = r.get("source", {})
    print(f"Connected: {s.get('type')}")
    print(f"Repo: {s.get('config', {}).get('owner')}/{s.get('config', {}).get('repo')}")
    print(f"Branch: {s.get('config', {}).get('production_branch')}")
else:
    for e in d2.get("errors", []):
        print(f"Error {e.get('code')}: {e.get('message')}")
    print("Full response:", json.dumps(d2, indent=2)[:1000])
