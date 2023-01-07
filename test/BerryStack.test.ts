import { expect, test } from 'vitest'
import { callerName } from "../src/BerryStack";

const chromeBrowserStack = `Error
    at dLogMessages (http://localhost:8000/src/util/DebugLog.ts:31:18)
    at dLog (http://localhost:8000/src/util/DebugLog.ts:4:18)
    at DynamicSized.hostConnected (http://localhost:8000/src/thimbleberry/DynamicSized.ts:9:7)
    at ChartPlot.addController (http://localhost:8000/node_modules/@lit/reactive-element/reactive-element.js:6:2491)
    at new DynamicSized (http://localhost:8000/src/thimbleberry/DynamicSized.ts:30:10)
    at ChartPlot.firstUpdated (http://localhost:8000/src/thimbleberry/ChartPlot.ts:75:5)
    at ChartPlot._$AE (http://localhost:8000/node_modules/@lit/reactive-element/reactive-element.js:6:5079)'
`;

test("caller name from chrome browser stack", () => {
  const name = callerName(chromeBrowserStack, 2);
  expect(name).toEqual("hostConnected");
});

test("file.caller from chrome browser stack", () => {
  const name = callerName(chromeBrowserStack, 2, true);
  expect(name).toEqual("DynamicSized.hostConnected");
});

const chromeStackGetter = `Error
    at dLogMessages (http://localhost:5173/@fs/Users/lee/heat/src/util/DebugLog.ts?t=1672528920055:50:29)
    at dLog (http://localhost:5173/@fs/Users/lee/heat/src/util/DebugLog.ts?t=1672528920055:20:18)
    at get shaders (http://localhost:5173/@fs/Users/lee/heat/src/webgpu/shaders/ColorEqualizeUnit.ts?t=1672528920055:37:5)
    at Reactive.update (http://localhost:5173/@fs/Users/lee/reactively/packages/core/dist/core.js?t=1671998219864:89:26)
    at Reactive.updateIfNecessary (http://localhost:5173/@fs/Users/lee/reactively/packages/core/dist/core.js?t=1671998219864:134:12)
    at Reactive.get (http://localhost:5173/@fs/Users/lee/reactively/packages/core/dist/core.js?t=1671998219864:53:12)
    at ColorEqualizeUnit.reactiveGet (http://localhost:5173/@fs/Users/lee/reactively/packages/decorate/dist/decorate.js?t=1671998219864:60:33)
    at ColorEqualizeUnit.encodeCommands (http://localhost:5173/@fs/Users/lee/heat/src/thimbleberry/packages/shader-util/ShaderComponent.ts?t=1672359746621:7:10)
    at http://localhost:5173/@fs/Users/lee/heat/src/webgpu/ShaderGroup.ts?t=1672528920055:13:37
    at Array.forEach (<anonymous>)`

test("caller name from getter", () => {
  const name = callerName(chromeStackGetter, 2, false); 
  expect(name).toEqual("get shaders");
});
