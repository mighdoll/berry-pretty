An experimental debug logging library.

Use berry-pretty's `dlog` instead of calling `console.log()` directly.

### dlog

- `dlog` statements are more concise to write and read in the source

```ts
dlog({ myNumber, myObject });
```

- `dlog`'s output is configurable. By default:
  - Function name is provided automatically.
  - Nested data structures are expanded .
  - Floating point precision shows a manageable number of digits.

```
Main.ts:7 myFunction           | myCount: 3.142  myObject: {some: {more: "stuff"}}
```

### console.log

Writing raw `console.log()` starts to feel verbose by comparision. 

```ts
console.log("myFunction()  myNumber:", myNumber, " myObject:", myObject);
```

and the logged output is harder to read or customize.

```
Main.ts:8 myFunction()  myNumber: 3.141592653589793  myObject: {some: {…}}
```

### Install and Use

```
$ npm install berry-pretty
```

```ts
import { dlog } from "berry-pretty";
```

### Features

- function name is logged automatically
- variable names are logged automatically
- nested data structures expanded by default (to configurable depth)
- (TBD) extensible to pretty-print custom formats for your favorite data structures

### Variations

```ts
dlog(...); // debug logging
derr(...); // errors
dwarn(...); // warning
dsert(test, ...); // assertions
dlogOpt(options, ...); // debug logging, with custom options
dLogDefaultOptions(options); // set default options for all future logging
```

### Options

```ts
{
  showFile?: boolean, // (false) show the file name as well as the function name
  precision?: number, // (4) numeric precision for floating point numbers
  maxDepth?: number,  // (6) log nested structures up to the depth
}
```

### Status

Early, experimental, but already seems useful. 
Needs testing on non-chrome and non-macos platforms.
Contributions welcome.
