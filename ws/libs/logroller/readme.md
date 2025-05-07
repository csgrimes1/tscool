### Goals
0. Do not force running code to format outputs when log modes are turned off.
0. Support table record logs, realizing the idea that logs are data.
0. Debounced log outputs that sample at an interval.
0. Sending is event-based.
0. Opinionated error handling. Errors are basically data in typescript and cannot
be caught by type. This API encourages unique error codes and formatting that lays
out well in log storage.


log.info?.write('')
const t = log.?debug.table({sample: 'data'})
t?.write({sample: 'more data'})
