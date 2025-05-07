#!/usr/bin/env bash
set -e
MYDIR="$(cd "$(dirname "$0")" && pwd)"
PROJDIR="$(cd "$MYDIR/../.." && pwd)"
TEMPDIR="$PROJDIR/.tmp"
mkdir -p "$TEMPDIR"

SWCRC=$(cat "$PROJDIR/.swcrc")
BASE_EXCLUDE=$(echo "$SWCRC" | jq -c '.exclude')
PATHS=$(cat "$PROJDIR/tsconfig.json" \
    | grep -vE '^\s*//' \
    | sed -e 's/\/\*.*\*\///g' \
    | grep -vE '^\s*$' \
    | jq '.compilerOptions.paths'
)

DISTRO=""

for FN in "$@"
do
    if [ -z "$DISTRO" ]; then
        # Second to last token in file naming scheme.
        DISTRO="$(echo "$FN" | rev | cut -d '.' -f2 | rev)"
    fi
    OVERLAY=$(cat "$PROJDIR/$FN" | jq -c '.')
    OV_EXCLUDE=$(echo "$OVERLAY" | jq -c '.exclude')
    NEW_EXCLUDE=$(echo "$BASE_EXCLUDE" | jq --argjson oe "$OV_EXCLUDE" '. + $oe')
    SWCRC=$(echo "$SWCRC" | \
        jq \
        --argjson overlay "$OVERLAY" \
        --argjson exclude "$NEW_EXCLUDE" \
        '. * $overlay * {exclude: $exclude}')
done

DISTRO="${DISTRO:-default}"

FINALCONFIG="$TEMPDIR/$DISTRO.swcrc"
echo "$SWCRC" | jq --argjson paths "$PATHS" '. * {jsc: {baseUrl: "../", paths: $paths}}' > "$FINALCONFIG"
echo '{}' | jq \
    --arg projdir "$PROJDIR" \
    --arg conf "$FINALCONFIG" \
    --arg distro "$DISTRO" \
    --arg tempdir "$TEMPDIR" \
    --arg outdir ".dist/$DISTRO" \
    '{projdir: $projdir, tempdir: $tempdir, outdir: $outdir, distro: $distro, conf: $conf,}'
