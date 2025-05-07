#!/usr/bin/env bash
MYDIR="$(cd "$(dirname "$0")" && pwd)"

CONFIGINFO=$("$MYDIR/swc/swcconfig.sh" "$@")

PROJDIR=$(echo "$CONFIGINFO" | jq -r '.projdir')
CONF=$(echo "$CONFIGINFO" | jq -r '.conf')
OUTDIR=$(echo "$CONFIGINFO" | jq -r '.outdir')

set -x
npx swc "$PROJDIR" --config-file "$CONF" --out-dir "$OUTDIR"  --delete-dir-on-start
