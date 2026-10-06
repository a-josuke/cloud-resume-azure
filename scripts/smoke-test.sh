#!/usr/bin/env bash
# scripts/smoke-test.sh
# Smoke test: call the REAL deployed API and site and check they behave.
# Usage: scripts/smoke-test.sh <api-url> <site-url>   (site url without a trailing slash)
set -euo pipefail

API_URL="${1:?usage: smoke-test.sh <api-url> <site-url>}"
SITE_URL="${2:?usage: smoke-test.sh <api-url> <site-url>}"

# A fresh environment needs a minute: cold start, role assignments spreading, site publishing.
# So retry for up to ~3 minutes on any error.
CURL=(curl -fsS --retry 12 --retry-delay 15 --retry-all-errors --max-time 60)

fail() { echo "SMOKE TEST FAILED: $1" >&2; exit 1; }

echo "1/8 API answers with a count..."
first=$("${CURL[@]}" "$API_URL")
echo "    $first"
c1=$(jq -r '.count' <<<"$first")
u1=$(jq -r '.uniqueCount' <<<"$first")
[[ "$c1" =~ ^[0-9]+$ ]] || fail "count is not a number"
[[ "$u1" =~ ^[0-9]+$ ]] || fail "uniqueCount is not a number"

echo "2/8 views go up by exactly 1 per call..."
second=$("${CURL[@]}" "$API_URL")
c2=$(jq -r '.count' <<<"$second")
u2=$(jq -r '.uniqueCount' <<<"$second")
[ "$c2" -eq $((c1 + 1)) ] || fail "expected count $((c1 + 1)), got $c2"

echo "3/8 a repeat visit does not add a unique visitor..."
[ "$u2" -eq "$u1" ] || fail "uniqueCount changed on a repeat visit ($u1 -> $u2)"
[ "$u2" -ge 1 ] || fail "uniqueCount should be at least 1"
[ "$u2" -le "$c2" ] || fail "uniqueCount ($u2) is higher than views ($c2)"

echo "4/8 site is up and has the counter..."
"${CURL[@]}" "$SITE_URL/" | grep -q 'visitor-count' || fail "site is missing the visitor-count element"

echo "5/8 site is wired to THIS environment's API (not the live one)..."
"${CURL[@]}" "$SITE_URL/config.js" | grep -q "$API_URL" || fail "config.js does not point to $API_URL"

echo "6/8 CORS: our site is allowed, a stranger's site is not..."
allowed=$(curl -sSI -H "Origin: $SITE_URL" "$API_URL" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)
[[ "$allowed" == *"$SITE_URL"* ]] || fail "API does not allow origin $SITE_URL (got: '$allowed')"
evil=$(curl -sSI -H "Origin: https://evil.example" "$API_URL" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)
[ -z "$evil" ] || fail "API allows a stranger's origin: $evil"

echo "7/8 the stats API answers with 30 days of numbers..."
STATS_URL="${API_URL%visitorCount}stats"
stats=$("${CURL[@]}" "$STATS_URL?days=30")
[ "$(jq '.days | length' <<<"$stats")" -eq 30 ] || fail "stats should return exactly 30 days (got: $(head -c 200 <<<"$stats"))"
jq -e '.days | all(.views | type == "number")' <<<"$stats" >/dev/null || fail "every day needs a numeric views field"
[ "$("${CURL[@]}" "$STATS_URL?days=abc" | jq '.days | length')" -eq 30 ] || fail "a bad days value should fall back to 30"

echo "8/8 the stats page is published..."
"${CURL[@]}" "$SITE_URL/stats.html" | grep -q 'Visitor stats' || fail "stats.html is missing from the site"

echo "All smoke tests passed."
