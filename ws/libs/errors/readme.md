## Errors

Adds form and function to JavaScript errors.

### Foreward

Some believe that errors should be handled at the point in code where they are returned. `Go`
is a language that encourages you to check errors immediately. Other languages, among them
JavaScript, allow errors to bubble up, collapse the call stack, and be handled by an upstream
callee. The beauty of the latter is that you don't mix boilerplate error handling into the main
business logic of your code.

The downside of throwing errors is that the errors themselves don't carry much useful information.
In JavaScript, you must parse a message field to classify an error. It's helpful to have a unique
code to identify an error, especially if you are collecting JSON logs for searchability. Obviously,
you can query by error code, but the codes could also be useful for cases such as triggering alerts.

### Design Goals

0. Treats errors as data rather than preformatted carriers of a text message. Formatting is
still a huge consideration, but this library forces text formatting to happen later.
0. Logs are data, and the error type defined in this library is well suited to
JSON log output.
0. Errors should have unique codes. This is a subjective and opinionated statement, but an error
object must carry something easy to consume to allow a catch block to react to it. We should not
be using regex to parse messages; rather, it is much simpler to check for a code.
0. Object oriented languages like Java catch a specific subclass of a base error class. While this
works, it's a bit obtuse. It depends on inheritence, a controversial language feature if there
ever was one. It forces you to import a number of types for your catch blocks. Regardless, catch by type
is not even supported in JavaScript or TypeScript. The case handling for different error types in
TypeScript requires logic to inspect the contents of the error; hence error codes.
0. Despite the design ideals of language creators, most catch blocks do very little. That said, the
little that they do can be very important. Logging is a critical part of observability, so having
well-formed errors helps in troubleshooting.
0. Why on Earth are stacks stored as text? Are we saving memory? I can't answer this, but I posit
that it's the wrong data type for storing that information. While strings are fine for raw console
output, stacks formats poorly in log viewers meant to display JSON objects and arrays. Therefore,
this module breaks stack traces into arrays of objects that can be formatted later.
