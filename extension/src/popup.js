class ViewController {
  #viewModel;

  #document;
  #listCommandsElement;

  constructor(document) {
    this.#document = document;
    this.#listCommandsElement = document.querySelector("#list-commands");
  }

  set viewModel(value) { this.#viewModel = value }

  viewModelDidChangeCommands() {
    this.#renderCommands(this.#viewModel.commands);
  }

  renderView() {
    this.#renderCommands(this.#viewModel.commands);
  }

  #renderCommands(commands) {
    if (commands == undefined) {
      return;
    }

    this.#displayCommands(commands);
  }

  #displayCommands(commands) {
    let template = this.#document.querySelector('#btn-command-template');
    let master = template.content.cloneNode(true)
                                 .querySelector(".btn-command")

    let buttons = commands.map(function (command, index) {
      let button = master.cloneNode(true);
      let label = button.querySelector(".btn-command-label");
      let title = button.querySelector(".btn-command-title");

      label.textContent = index;
      title.textContent = command.label;

      button.dataset.id = command.id;

      button.addEventListener("click", this.#didClickCommandButton.bind(this), false);

      return button;
    }.bind(this));

    this.#listCommandsElement.replaceChildren(...buttons);
  }

  #didClickCommandButton(event) {
    let command = event.currentTarget.dataset;

    this.#viewModel.runCommand(command.id);
  }
}

class ViewModel {
  #model;
  #coordinatorDelegate;
  #viewDelegate;

  #commands;

  constructor() {}

  set model(value) { this.#model = value }
  set coordinatorDelegate(value) { this.#coordinatorDelegate = value }
  set viewDelegate(value) { this.#viewDelegate = value }

  set commands(value) {
    this.#commands = value;

    this.#viewDelegate.viewModelDidChangeCommands();
  }

  get commands() {
    if (this.#commands != undefined) {
      return this.#commands;
    }

    let callback = function (commands) {
      this.commands = commands;
    }.bind(this);

    this.#model.listCommands(callback)
  }

  runCommand(commandID) {
    let callback = function (response) {
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
    this.#connection = browser.runtime.connect({ name:"urn:browser-ext:dev.sulim.q:popup" });
    this.#connection.onMessage.addListener(this.#onMessage.bind(this));

    // Fetch page context (URL, HTML, text).
    let executing = browser.tabs.executeScript({
      file: "content.js",
    });
    executing.then(
      function (result) {
        this.#context = result[0];
      }.bind(this),
      function () {
        console.error(arguments);
      }.bind(this)
    );
  }

  listCommands(callback) {
    let rpcRequestID = this.#generateRequestID();
    let rpcRequest = {
      "jsonrpc": "2.0",
      "method": "ListCommands",
      "id": rpcRequestID
    }

    this.#rpcCallbacksQueue.set(rpcRequestID, callback)

    this.#connection.postMessage(rpcRequest);
  }

  runCommand(commandID, callback) {
    let rpcRequestID = this.#generateRequestID();
    let rpcRequest = {
      "jsonrpc": "2.0",
      "method": "RunCommand",
      "params": [commandID, this.#context],
      "id": rpcRequestID
    }

    this.#rpcCallbacksQueue.set(rpcRequestID, callback)

    this.#connection.postMessage(rpcRequest);
  }

  #onMessage(message, connection) {
    let callback = this.#rpcCallbacksQueue.get(message.id);

    if (callback == undefined) {
      return;
    }

    callback(message.result);
  }

  #generateRequestID() {
    return `urn:browser-ext:dev.sulim.q:rpc-request:${this.#rpcCallbacksQueue.size + 1}`
  }
}

class Coordinator {
  #window;

  constructor(window) {
    this.#window = window;
  }

  start() {
    let viewController = new ViewController(this.#window.document);
    let viewModel = new ViewModel();

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
  let coordinator = new Coordinator(this);

  coordinator.start();
});
