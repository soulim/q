class RPCServer {
	#browser;
	#connections;

	constructor(browser) {
		this.#browser = browser;
		this.#connections = [];
	}

	start() {
		this.#browser.runtime.onConnect.addListener(this.#onConnect.bind(this));
	}

	#onConnect(connection) {
		if (connection.name !== "urn:browser-ext:dev.sulim.q:popup") {
			return;
		}

		connection.onMessage.addListener(this.#onMessage.bind(this));

		this.#connections.push(connection);
	}

	#onMessage(message, connection) {
		const rpcRequest = {
			jsonrpc: "2.0",
			id: message.id,
		};
		const onError = (error) => {
			console.debug("RPCServer#onMessage/onError");
			console.debug(error);
		};

		switch (message.method) {
			case "ListCommands": {
				const onSuccess = (response) => {
					connection.postMessage({
						jsonrpc: "2.0",
						result: response.result,
						id: response.id,
					});
				};

				rpcRequest.method = "ListCommands";

				this.#sendNativeMessage(rpcRequest, onSuccess, onError);
				break;
			}
			case "RunCommand": {
				const commandID = message.params[0];
				const pageURL =
					message.params[1] !== undefined ? message.params[1].url : null;
				const pageHTML =
					message.params[1] !== undefined ? message.params[1].html : null;

				rpcRequest.method = "RunCommand";
				rpcRequest.params = [commandID, pageURL, pageHTML];

				const onSuccess = (response) => {
					console.debug("RPCServer#onMessage/onSuccess");
					console.debug(response);

					if (response.result !== "") {
						this.#browser.notifications.create({
							type: "basic",
							title: "Response from Q command",
							message: response.result,
						});
					}
				};

				this.#sendNativeMessage(rpcRequest, onSuccess, onError);

				connection.postMessage({
					jsonrpc: "2.0",
					result: null,
					id: message.id,
				});
				break;
			}
			default: {
				console.debug(message);
			}
		}
	}

	#sendNativeMessage(message, onSuccess, onError) {
		const sending = this.#browser.runtime.sendNativeMessage(
			"dev.sulim.q",
			message,
		);
		sending.then(onSuccess.bind(this), onError.bind(this));
	}
}

export { RPCServer };
