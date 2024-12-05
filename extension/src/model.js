class Model {
  #connection;

  #rpcCallbacksQueue;
  #context;

  constructor() {
    this.#rpcCallbacksQueue = new Map();
    this.#connection = browser.runtime.connect({
      name: "urn:browser-ext:dev.sulim.q:popup",
    });
    this.#connection.onMessage.addListener(this.#onMessage.bind(this));

    // Fetch page context (URL and HTML).
    const executing = browser.tabs.executeScript({
      file: "content.js",
    });
    executing.then(
      function (result) {
        this.#context = result[0];
      }.bind(this),
      function () {
        console.error(arguments);
      },
    );
  }

  listCommands(callback) {
    const rpcRequestID = this.#generateRequestID();
    const rpcRequest = {
      jsonrpc: "2.0",
      method: "ListCommands",
      id: rpcRequestID,
    };

    this.#rpcCallbacksQueue.set(rpcRequestID, callback);

    this.#connection.postMessage(rpcRequest);
  }

  runCommand(commandID, callback) {
    const rpcRequestID = this.#generateRequestID();
    const rpcRequest = {
      jsonrpc: "2.0",
      method: "RunCommand",
      params: [commandID, this.#context],
      id: rpcRequestID,
    };

    this.#rpcCallbacksQueue.set(rpcRequestID, callback);

    this.#connection.postMessage(rpcRequest);
  }

  #onMessage(message, connection) {
    const callback = this.#rpcCallbacksQueue.get(message.id);

    if (callback === undefined) {
      return;
    }

    callback(message.result);
  }

  #generateRequestID() {
    return `urn:browser-ext:dev.sulim.q:rpc-request:${
      this.#rpcCallbacksQueue.size + 1
    }`;
  }
}

export { Model };
