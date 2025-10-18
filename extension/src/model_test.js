import test from "node:test";

import { MockBrowser } from "./mock_browser.js";
import { Model } from "./model.js";

test("Model", async (t) => {
  await t.test("opens a connection to the extension", (tt) => {
    const browser = new MockBrowser();

    new Model(browser);

    const exp = 1;
    const act = browser.runtime.openPorts.size;
    tt.assert.strictEqual(act, exp, `expected ${exp} connections, got ${act}`);
  });

  // TODO: Add a test to assess the name of open connection.

  await t.test("executes a content script", (tt) => {
    const browser = new MockBrowser();

    new Model(browser);

    const exp = 1;
    const act = browser.tabs.executedScripts.size;
    tt.assert.strictEqual(
      act,
      exp,
      `expected ${exp} executed scripts, got ${act}`,
    );
  });

  // TODO: Add a test to assess the name of the executed script.

  await t.test("listCommands posts a message through open port", (tt) => {
    const browser = new MockBrowser();
    const model = new Model(browser);
    const callback = () => {};

    model.listCommands(callback);

    const exp = 1;
    const act = browser.runtime.openPorts.get(
      "urn:browser-ext:dev.sulim.q:popup",
    ).postedMessages.length;

    tt.assert.strictEqual(act, exp, `expected ${exp} messages, got ${act}`);
  });

  // TODO: Add a test to assess details of the posted message on a call to listCommands.
});
