import subprocess, json

ACCOUNT = "107604041df5273090d9dbaa9f3dc796"
AUTH = "Authorization: Bearer cfoat_IvZgTTNeaaJ9ZNQgbhuIFVcR5MNqKFxD9qIf9tbkhdc.KkcrZAQcucz7JPsPqmrSUT4IDbq98uz3P0HZ0wCCs8g"
CT = "Content-Type: application/json"

# Check all projects for git connections
r = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/projects",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)

d = json.loads(r.stdout)
for p in d.get("result", []):
    s = p.get("source")
    if s:
        cfg = s.get("config", {})
        print(f"{p['name']}: {s.get('type')} -> {cfg.get('owner')}/{cfg.get('repo')} branch={cfg.get('production_branch')}")
    else:
        print(f"{p['name']}: direct upload only (no git)")

# Try to list available GitHub repos from Cloudflare's perspective
r2 = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/source/github/repos",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)

d2 = json.loads(r2.stdout)
print(f"\nGitHub repos available: {d2.get('success')}")
if d2.get("result"):
    for repo in d2.get("result", []):
        print(f"  - {repo.get('name')} by {repo.get('owner')}")
else:
    print(f"  Errors: {d2.get('errors', ['no endpoint found'])}")
    print(f"  Trying pages/projects/sources next...")

# Try alternative endpoint
r3 = subprocess.run(["curl", "-s",
    f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/pages/sources",
    "-H", AUTH, "-H", CT], capture_output=True, text=True)
print(f"\nSources endpoint: {r3.stdout[:300]}")
