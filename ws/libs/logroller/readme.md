### Goals
0. Do not force running code to format outputs when log modes are turned off.
0. Support table record logs, realizing the idea that logs are data.
0. Debounced log outputs that sample at an interval.
0. Sending is event-based.

```bash
# Configure using environment
export LOGROLLER_LOG_LEVEL=debug
export LOGROLLER_LISTENERS='["pretty","json"]'
```
