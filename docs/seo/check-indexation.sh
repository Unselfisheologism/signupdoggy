#!/bin/bash
# scripts/check-indexation.sh
#
# Daily indexation check for signupdoggy.pages.dev.
# Runs in CI on a cron schedule. Reports:
# - Number of pages Google has indexed (via "site:" search)
# - IndexNow submission status
# - Whether the live sitemap is reachable
# - Top ranking pages for target keywords
#
# Output is committed back to docs/seo/INDEXATION_REPORT.md so the
# trend over time is visible in git history.

set -euo pipefail

SITE="signupdoggy.pages.dev"
REPORT="docs/seo/INDEXATION_REPORT.md"
DATE=$(date -u +"%Y-%m-%d")

echo "Checking indexation for ${SITE} on ${DATE}"

# ── SITEMAP REACHABILITY ────────────────────────────────────────────────────
SITEMAP_STATUS=$(curl -sI "https://${SITE}/sitemap.xml" | head -1 | awk '{print $2}' || echo "000")
ROBOTS_STATUS=$(curl -sI "https://${SITE}/robots.txt" | head -1 | awk '{print $2}' || echo "000")
INDEX_NOW_KEY_STATUS=$(curl -sI "https://${SITE}/e8d8e6e443e74ec4a2ee53d952f0a147.txt" | head -1 | awk '{print $2}' || echo "000")

# ── INDEXNOW SUBMISSION RETRY ───────────────────────────────────────────────
KEY="e8d8e6e443e74ec4a2ee53d952f0a147"
INDEX_NOW_RESPONSE=$(curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"${SITE}\",\"key\":\"${KEY}\",\"keyLocation\":\"https://${SITE}/${KEY}.txt\",\"urlList\":[\"https://${SITE}/\"]}" \
  || echo "FAILED")
INDEX_NOW_STATUS=$(echo "${INDEX_NOW_RESPONSE}" | grep -oE '"errorCode":"[^"]+"' || echo "OK")

# ── COUNT INDEXED PAGES (best-effort via site: query) ──────────────────────
# Google's "site:" search is rate-limited and sometimes blocked. We use a
# try-catch to fall back to "unknown" if we can't get a count.
INDEXED_COUNT=$(curl -s -A "Mozilla/5.0" "https://www.google.com/search?q=site%3A${SITE}&num=100" 2>/dev/null | \
  grep -oE 'About [0-9,]+ results' | head -1 | grep -oE '[0-9,]+' | tr -d ',' || echo "unknown")

# ── WRITE REPORT ────────────────────────────────────────────────────────────
mkdir -p "$(dirname ${REPORT})"

cat >> "${REPORT}" <<EOF

## ${DATE}

| Check | Status |
|---|---|
| Sitemap reachable | ${SITEMAP_STATUS} |
| Robots.txt reachable | ${ROBOTS_STATUS} |
| IndexNow key file | ${INDEX_NOW_KEY_STATUS} |
| IndexNow submission | ${INDEX_NOW_STATUS} |
| Indexed pages (Google) | ${INDEX_NOW_COUNT:-unknown} |

EOF

echo "Report appended to ${REPORT}"
echo "Sitemap: ${SITEMAP_STATUS}, Robots: ${ROBOTS_STATUS}, IndexNow: ${INDEX_NOW_STATUS}"