class RPCServer {
  #connections;

  constructor() {
    this.#connections = [];
  }

  start() {
    browser.runtime.onConnect.addListener(this.#onConnect.bind(this));
  }

  #onConnect(connection) {
    if (connection.name != "urn:browser-ext:dev.sulim.q:popup") {
      return;
    }

    connection.onMessage.addListener(this.#onMessage.bind(this));

    this.#connections.push(connection);
  }

  #onMessage(message, connection) {
    let rpcRequest = {
      "jsonrpc": "2.0",
      "id": message.id
    };
    let onSuccess = function (response) {
      connection.postMessage({
        "jsonrpc": "2.0",
        "result": response.result,
        "id": response.id
      });
    }
    let onError = function (error) {
      console.debug("RPCServer#onMessage/onError");
      console.debug(error);
    }

    switch (message.method) {
      case "ListCommands":
        rpcRequest["method"] = "ListCommands";

        this.#sendNativeMessage(rpcRequest, onSuccess, onError);
        break;
      case "RunCommand":
        let commandID = message.params[0]
        let pageURL = (message.params[1] !== undefined) ? message.params[1].url : null;
        let pageHTML = (message.params[1] !== undefined) ? message.params[1].html : null;
        let pageText = (message.params[1] !== undefined) ? message.params[1].text : null;

        rpcRequest["method"] = "RunCommand";
        rpcRequest["params"] = [
          commandID,
          pageURL,
          pageHTML,
          pageText,
        ];

        this.#sendNativeMessage(rpcRequest, onSuccess, onError);
        break;
      default:
        console.debug(message);
        return;
    }
  }

  #sendNativeMessage(message, onSuccess, onError) {
    let sending = browser.runtime.sendNativeMessage("dev.sulim.q", message);
    sending.then(onSuccess.bind(this), onError.bind(this));
  }
}

let rpcServer = new RPCServer();

rpcServer.start();
