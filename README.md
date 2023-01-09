An experimental debug logging library.

Use berry-pretty's `dlog` instead of calling `console.log()` directly.  
* `dlog` statements are more concise to write and read.
* `dlog`'s output expands nested data structures by default, and is configurable.

```ts
dlog({ myCount, myValue });
```

The old way starts to feel very verbose by comparision:

```ts
console.log("myFunction()  myCount:", myCount, " myValue:", myValue);
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
