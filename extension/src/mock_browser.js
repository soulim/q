// MockBrowser represents a browser object available for background scripts.
//
// - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// - https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs
class MockBrowser {
  #runtime;
  #tabs;

  constructor() {
    this.#runtime = new MockRuntime();
    this.#tabs = new MockTabs();
  }

  get runtime() {
    return this.#runtime;
  }

  get tabs() {
    return this.#tabs;
  }
}

// MockRuntime represents a runtime accessible through a browser object.
//
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime
class MockRuntime {
  #nativeMessages;
  #onConnect;
  #openPorts;

  constructor() {
    this.#nativeMessages = new Map();
    this.#onConnect = new MockEvent();
    this.#openPorts = new Map();
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
  connect(...args) {
    const extensionId = typeof args[0] === "string" || args[0] instanceof String ? args.shift() : undefined;
    const connectInfo = typeof args[0] === "object" || args[0] instanceof Object ? args.shift() : undefined;
    const port = new MockPort(connectInfo.name);

    this.#onConnect.dispatch(port);
    this.#openPorts.set(extensionId || connectInfo.name, port);

    return port;
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendNativeMessage
  sendNativeMessage(application, message) {
    // Store messages per application.
    const messages = this.#nativeMessages.has(application) ? this.#nativeMessages.get(application) : [];
    messages.push(message);
    this.#nativeMessages.set(application, messages);

    return new Promise(
      () => {},
      () => {},
    );
  }

  // onConnect represents runtime.onConnect event.
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onConnect
  get onConnect() {
    return this.#onConnect;
  }

  // nativeMessages gives access to collected native messages.
  //
  // NOTE: This method is for test cases only.
  get nativeMessages() {
    return this.#nativeMessages;
  }

  // openPorts gives access to open ports/connections.
  //
  // NOTE: This method is for test cases only.
  get openPorts() {
    return this.#openPorts;
  }
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
class MockPort {
  #name;
  #onMessage;
  #postedMessages;

  constructor(name) {
    this.#name = name;
    this.#onMessage = new MockEvent();
    this.#postedMessages = [];
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port#name
  get name() {
    return this.#name;
  }

  postMessage(message) {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
    const data = JSON.parse(JSON.stringify(message));

    this.#onMessage.dispatch(data, this);
    this.#postedMessages.push(data);
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port#onmessage
  get onMessage() {
    return this.#onMessage;
  }

  // postedMessages gives access to messages posted through the port.
  //
  // NOTE: This method is for test cases only.
  get postedMessages() {
    return this.#postedMessages;
  }
}

// MockEvent represents a generic event.
class MockEvent {
  #listeners;

  constructor() {
    this.#listeners = [];
  }

  addListener(listener) {
    this.#listeners.push(listener);
  }

  dispatch(...args) {
    this.#listeners.forEach((listener) => {
      listener.call(null, ...args);

      return;
    });
  }

  // listeners gives access to collected listeners.
  //
  // NOTE: This method is for test cases only.
  get listeners() {
    return this.#listeners;
  }
}

// MockTabs represents the browser's tab system.
//
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs
class MockTabs {
  #executedScripts;

  constructor() {
    this.#executedScripts = new Map();
  }

  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/executeScript
  executeScript(...args) {
    const tabId = typeof args[0] === "number" || args[0] instanceof Number ? args.shift() : undefined;
    const details = typeof args[0] === "object" || args[0] instanceof Object ? args.shift() : undefined;

    this.#executedScripts.set(tabId, details);

    return new Promise((resolve, reject) => {
      try {
        const result = [];
        resolve(result);
      } catch {
        reject();
      }
    });
  }

  // executedScripts gives access to executed scripts.
  //
  // NOTE: This method is for test cases only.
  get executedScripts() {
    return this.#executedScripts;
  }
}

export { MockBrowser };
