# SignupDoggy — Indexation Report

> Daily snapshot of how Google, Bing, and IndexNow see signupdoggy.pages.dev.
> Appended by `scripts/check-indexation.sh` on every cron run.

## How to read this report

- **Sitemap reachable**: 200 = good. Anything else = broken.
- **Robots.txt reachable**: 200 = good. 5xx = blocker.
- **IndexNow key file**: 200 = the key file is deployed (required for IndexNow submissions).
- **IndexNow submission**: "OK" = URLs were accepted. "UserForbiddedToAccessSite" = the key hasn't been validated by IndexNow yet (typical first 24-48 hours after key creation).
- **Indexed pages (Google)**: number of URLs Google has indexed. "unknown" means the `site:` search was rate-limited or blocked.

## Target milestones

| Milestone | Expected by |
|---|---|
| Sitemap, robots, key all 200 | Day 1 (manual check) |
| IndexNow "OK" | Day 2–3 |
| 10+ indexed pages | Day 7 |
| 30+ indexed pages | Day 14 |
| 45 indexed pages | Day 21 |
| "disposable email checker" rank <50 | Day 30 |
| "disposable email checker" rank <20 | Day 60 |
| "ipqualityscore alternative" rank <30 | Day 30 |
| "fraud detection API" rank <50 | Day 60 |

## Reports

EOF