/* global browser */

class ViewController {
  #viewModel;

  #document;
  #listCommandsElement;

  constructor(document) {
    this.#document = document;
    this.#listCommandsElement = document.querySelector("#list-commands");
  }

  set viewModel(value) {
    this.#viewModel = value;
  }

  viewModelDidChangeCommands() {
    this.#renderCommands(this.#viewModel.commands);
  }

  renderView() {
    this.#renderCommands(this.#viewModel.commands);
  }

  #renderCommands(commands) {
    if (commands === undefined) {
      return;
    }

    this.#displayCommands(commands);
  }

  #displayCommands(commands) {
    const template = this.#document.querySelector("#btn-command-template");
    const master = template.content
      .cloneNode(true)
      .querySelector(".btn-command");

    const buttons = commands.map(
      function (command, index) {
        const button = master.cloneNode(true);
        const label = button.querySelector(".btn-command-label");
        const title = button.querySelector(".btn-command-title");

        label.textContent = index;
        title.textContent = command.label;

        button.dataset.id = command.id;

        button.addEventListener(
          "click",
          this.#didClickCommandButton.bind(this),
          false
        );

        return button;
      }.bind(this)
    );

    this.#listCommandsElement.replaceChildren(...buttons);
  }

  #didClickCommandButton(event) {
    const command = event.currentTarget.dataset;

    this.#viewModel.runCommand(command.id);
  }
}

class ViewModel {
  #model;
  #coordinatorDelegate;
  #viewDelegate;

  #commands;

  set model(value) {
    this.#model = value;
  }

  set coordinatorDelegate(value) {
    this.#coordinatorDelegate = value;
  }

  set viewDelegate(value) {
    this.#viewDelegate = value;
  }

  set commands(value) {
    this.#commands = value;

    this.#viewDelegate.viewModelDidChangeCommands();
  }

  get commands() {
    if (this.#commands !== undefined) {
      return this.#commands;
    }

    const callback = function (commands) {
      this.commands = commands;
    }.bind(this);

    this.#model.listCommands(callback);
  }

  runCommand(commandID) {
    const callback = function (response) {
      console.debug(response);
      this.#coordinatorDelegate.viewModelDidFinish();
    }.bind(this);

    this.#model.runCommand(commandID, callback);
  }
}

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

    // Fetch page context (URL, HTML, text).
    const executing = browser.tabs.executeScript({
      file: "content.js",
    });
    executing.then(
      function (result) {
        this.#context = result[0];
      }.bind(this),
      function () {
        console.error(arguments);
      }
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

class Coordinator {
  #window;

  constructor(window) {
    this.#window = window;
  }

  start() {
    const viewController = new ViewController(this.#window.document);
    const viewModel = new ViewModel();

    viewController.viewModel = viewModel;

    viewModel.model = new Model();
    viewModel.coordinatorDelegate = this;
    viewModel.viewDelegate = viewController;

    viewController.renderView();
  }

  viewModelDidFinish() {
    this.#window.close();
  }
}

window.addEventListener("load", function () {
  const coordinator = new Coordinator(this);

  coordinator.start();
});
