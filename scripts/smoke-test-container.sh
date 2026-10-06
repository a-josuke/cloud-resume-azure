#!/usr/bin/env bash
# scripts/smoke-test-container.sh
# Smoke test for the container API: call the REAL deployed app and check it behaves.
# Usage: scripts/smoke-test-container.sh <app-url> <allowed-site-url>   (no trailing slashes)
set -euo pipefail

APP_URL="${1:?usage: smoke-test-container.sh <app-url> <site-url>}"
SITE_URL="${2:?usage: smoke-test-container.sh <app-url> <site-url>}"
API_URL="$APP_URL/api/visitorCount"

# The app scales to zero, so the first call after idle starts a replica (cold start, up to ~30 s).
# Retry for up to ~3 minutes on any error.
CURL=(curl -fsS --retry 12 --retry-delay 15 --retry-all-errors --max-time 60)

fail() { echo "SMOKE TEST FAILED: $1" >&2; exit 1; }

echo "1/8 health probe answers..."
[ "$("${CURL[@]}" "$APP_URL/healthz" | jq -r '.status')" = "ok" ] || fail "/healthz did not say ok"

echo "2/8 API answers with a count..."
first=$("${CURL[@]}" "$API_URL")
echo "    $first"
c1=$(jq -r '.count' <<<"$first")
u1=$(jq -r '.uniqueCount' <<<"$first")
[[ "$c1" =~ ^[0-9]+$ ]] || fail "count is not a number"
[[ "$u1" =~ ^[0-9]+$ ]] || fail "uniqueCount is not a number"

echo "3/8 views go up by exactly 1 per call..."
second=$("${CURL[@]}" "$API_URL")
c2=$(jq -r '.count' <<<"$second")
u2=$(jq -r '.uniqueCount' <<<"$second")
[ "$c2" -eq $((c1 + 1)) ] || fail "expected count $((c1 + 1)), got $c2"

echo "4/8 a repeat visit does not add a unique visitor..."
[ "$u2" -eq "$u1" ] || fail "uniqueCount changed on a repeat visit ($u1 -> $u2)"
[ "$u2" -le "$c2" ] || fail "uniqueCount ($u2) is higher than views ($c2)"

echo "5/8 the stats API returns 30 days of numbers..."
stats=$("${CURL[@]}" "$APP_URL/api/stats?days=30")
[ "$(jq '.days | length' <<<"$stats")" -eq 30 ] || fail "stats should return exactly 30 days"
jq -e '.days | all(.views | type == "number")' <<<"$stats" >/dev/null || fail "every day needs a numeric views field"

echo "6/8 CORS: our site is allowed, a stranger's site is not..."
allowed=$(curl -sSI -H "Origin: $SITE_URL" "$API_URL" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)
[[ "$allowed" == *"$SITE_URL"* ]] || fail "API does not allow origin $SITE_URL (got: '$allowed')"
evil=$(curl -sSI -H "Origin: https://evil.example" "$API_URL" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)
[ -z "$evil" ] || fail "API allows a stranger's origin: $evil"

echo "7/8 only GET is accepted..."
code=$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$API_URL")
[ "$code" = "405" ] || fail "DELETE should return 405, got $code"

echo "8/8 the response says which revision answered..."
rev=$(curl -sSI "$APP_URL/healthz" | tr -d '\r' | grep -i '^x-app-revision:' || true)
[ -n "$rev" ] || fail "x-app-revision header is missing"
echo "    $rev"

echo "All smoke tests passed."
