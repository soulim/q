import test from "node:test";

import { MockBrowser } from "./mock_browser.js";
import { RPCServer } from "./rpc_server.js";

test("RPCServer", async (t) => {
  await t.test("adds a listener for runtime.onConnect events on start()", (tt) => {
    const browser = new MockBrowser();
    const server = new RPCServer(browser);

    server.start();

    const exp = 1;
    const act = browser.runtime.onConnect.listeners.length;
    tt.assert.strictEqual(act, exp, `expected ${exp} listeners, got ${act}`);
  });

  await t.test("sends a native message upon receiving a request with `ListCommands` method", (tt) => {
    const browser = new MockBrowser();
    const server = new RPCServer(browser);

    server.start();

    // Simulate a connection to the server.
    const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
    const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
    const port = browser.runtime.connect(extensionId, {
      name: portName,
    });

    // Call `ListCommands` method on the server.
    // TODO: Add a class to define RPC requests.
    const request = {
      id: "1",
      method: "ListCommands",
    };
    port.postMessage(request);

    const msg = browser.runtime.nativeMessages.get("dev.sulim.q") || [];
    const exp = 1;
    const act = msg.length;
    tt.assert.strictEqual(act, exp, `expected ${exp} native messages sent to "dev.sulim.q", got ${act}`);
  });

  await t.test("sends a native message upon receiving a request with `RunCommand` method", (tt) => {
    const browser = new MockBrowser();
    const server = new RPCServer(browser);

    server.start();

    // Simulate a connection to the server.
    const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
    const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
    const port = browser.runtime.connect(extensionId, {
      name: portName,
    });

    // Call `RunCommand` method on the server.
    // TODO: Add a class to define RPC requests.
    const request = {
      id: "1",
      method: "RunCommand",
      params: [],
    };
    port.postMessage(request);

    const msg = browser.runtime.nativeMessages.get("dev.sulim.q") || [];
    const exp = 1;
    const act = msg.length;
    tt.assert.strictEqual(act, exp, `expected ${exp} native messages sent to "dev.sulim.q", got ${act}`);
  });

  await t.test("does not send any native message upon receiving an RPC method call for unknown command", (tt) => {
    const browser = new MockBrowser();
    const server = new RPCServer(browser);

    server.start();

    // Simulate a connection to the server.
    const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
    const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
    const port = browser.runtime.connect(extensionId, {
      name: portName,
    });

    // Call `foobar` method on the server.
    // TODO: Add a class to define RPC requests.
    const request = {
      id: "1",
      method: "foobar",
      params: [],
    };
    port.postMessage(request);

    const msg = browser.runtime.nativeMessages.get("dev.sulim.q") || [];
    const exp = 0;
    const act = msg.length;
    tt.assert.strictEqual(act, exp, `expected ${exp} native messages sent to "dev.sulim.q", got ${act}`);
  });

  // TODO: Add tests for each RPC command for onSuccess and onError responses received from the host.
});
