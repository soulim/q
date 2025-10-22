import test from "node:test";

import { ViewModel } from "./view_model.js";

// MockModel represents a model used by the view model.
class MockModel {
  #ranCommands;

  constructor() {
    this.#ranCommands = new Map();
  }

  runCommand(commandID, callback) {
    const counter = this.#ranCommands.get(commandID) || 0;

    // Trigger given callback in case some test relies on that.
    callback.call(null);

    this.#ranCommands.set(commandID, counter + 1);
  }

  // ranCommands gives access to executed commands.
  //
  // NOTE: This method is for test cases only.
  get ranCommands() {
    return this.#ranCommands;
  }
}

// MockCoordinator represents a coordinator connected to the view model.
class MockCoordinator {
  #callbacks;

  constructor() {
    this.#callbacks = new Map();
  }

  viewModelDidFinish() {
    const counter = this.#callbacks.get("viewModelDidFinish") || 0;

    this.#callbacks.set("viewModelDidFinish", counter + 1);
  }

  // callbacks gives access to triggered callbacks.
  //
  // NOTE: This method is for test cases only.
  get callbacks() {
    return this.#callbacks;
  }
}

test("ViewModel", async (t) => {
  await t.test("runCommand runs given command ID through the model", (tt) => {
    const viewModel = new ViewModel();
    const model = new MockModel();
    viewModel.model = model;

    viewModel.runCommand("foo");

    const exp = 1;
    const act = model.ranCommands.get("foo");
    tt.assert.strictEqual(act, exp, `expected ${exp} commands to be executed, got ${act}`);
  });

  await t.test("runCommand triggers viewModelDidFinish callback on the coordinator delegate from the model callback", (tt) => {
    const viewModel = new ViewModel();
    const coordinatorDelegate = new MockCoordinator();
    const model = new MockModel();
    viewModel.model = model;
    viewModel.coordinatorDelegate = coordinatorDelegate;

    viewModel.runCommand("foo");

    const exp = 1;
    const act = coordinatorDelegate.callbacks.get("viewModelDidFinish");
    tt.assert.strictEqual(act, exp, `expected ${exp} viewModelDidFinish callbacks to be triggered, got ${act}`);
  });
});
