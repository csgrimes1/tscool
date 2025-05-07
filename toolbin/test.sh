#!/usr/bin/env bash
MYDIR="$(cd "$(dirname "$0")" && pwd)"

# Render a debug configuration for testing.
CONFIGINFO=$("$MYDIR/swc/swcconfig.sh" ".swcrc.debug.json")

# Read the outputs.
PROJDIR=$(echo "$CONFIGINFO" | jq -r '.projdir')
CONF=$(echo "$CONFIGINFO" | jq -r '.conf')

# Load the template for jest.conf.
JEST_PRELIM="$(cat "$PROJDIR/testconfig.swcjest.json")"
# Render what we're going to use for the SWC config in jest, setting the baseUrl to the project directory.
SWCCONF="$(cat "$CONF" | jq -c '. * {jsc: {baseUrl: "./"}}')"
# Rip what we'll pass at the command line as the Jest configuration, with compact flag.
JESTCONF=$(cat "$PROJDIR/testconfig.swcjest.json" | \
    jq -c --argjson sc "$SWCCONF" '. * {transform: {"^.+\\.[tj]sx?$": ["@swc/jest", $sc]}}'
)

npx jest -c "$JESTCONF" --runInBand  "$@"
