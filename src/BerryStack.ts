export function callerName(stack: string, level = 1, showFile = false): string {
  const lines = stack.split("\n");
  if (lines.length && lines[0].startsWith("Error")) {
    return callerFromChromeStack(lines, level, showFile);
  } else {
    return callerFromFirefoxStack(lines, level, showFile);
  }
}

function callerFromFirefoxStack(
  stackLines: string[],
  level = 1,
  showFile = false
): string {
  showFile; // lint
  if (stackLines.length < level) {
    return "";
  }
  const line = stackLines[level];
  const atDex = line.indexOf("@");
  if (atDex === -1) {
    return "";
  }
  return line.slice(0, atDex);
}

function callerFromChromeStack(
  stackLines: string[],
  level = 1,
  showFile = false
): string {
  if (stackLines.length < level + 1) {
    return "";
  }
  const line = stackLines[level + 1];

  const afterAt = startAfterAt(line);
  if (!afterAt) {
    return "";
  }

  const paren = afterAt.indexOf(" (");
  if (paren > 0) {
    // example:
    //   at setupPlots (http://localhost:8080/chart/Plot.js:48:3)
    const fullFunctionName = afterAt.slice(0, paren);
    const functionName = afterDot(fullFunctionName);
    if (showFile) {
      const fileName = fileFromUrlLine(afterAt);
      return `${fileName}.${functionName}`;
    } else {
      return functionName;
    }
  } else {
    // TODO does this still appear in chrome stacks? 

    // example:
    //   at http://localhost:8080/chart/Chart.js:143:7
    return fileFromUrlLine(afterAt);
  }
}

function fileFromUrlLine(text: string): string {
  let start = 0;
  let end = text.length;
  const slash = text.lastIndexOf("/"); // skip to last path segment
  if (slash > 0) {
    start = slash + 1;
    const lastColon = text.lastIndexOf(":");
    if (lastColon > 0) {
      const secondColon = text.lastIndexOf(":", lastColon - 1);
      if (secondColon > 0) {
        end = secondColon;
      } else {
        end = lastColon;
      }
    }
  }
  const fileWithSuffix = text.slice(start, end);

  return beforeDot(fileWithSuffix);
}

const at = "at ";

function startAfterAt(line: string): string | undefined {
  const atDex = line.indexOf(at);
  if (atDex === -1) {
    return undefined;
  }
  const start = atDex + at.length;
  return line.slice(start);
}

function beforeDot(text: string): string {
  const dot = text.lastIndexOf(".");
  if (dot > 0) {
    return text.slice(0, dot);
  } else {
    return text;
  }
}

function afterDot(text: string): string {
  const dot = text.indexOf(".");
  if (dot > 0) {
    return text.slice(dot + 1);
  } else {
    return text;
  }
}
