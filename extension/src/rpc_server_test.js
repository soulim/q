import test from "node:test";

import { RPCServer } from "./rpc_server.js";

// MockBrowser represents a browser object available for background scripts.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
class MockBrowser {
	#runtime;

	constructor() {
		this.#runtime = new MockRuntime();
	}

	get runtime() {
		return this.#runtime;
	}
}

// MockRuntime represents a runtime accessible through a browser object.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime
class MockRuntime {
	#nativeMessages;
	#onConnect;

	constructor() {
		this.#nativeMessages = new Map();
		this.#onConnect = new MockEvent();
	}

	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
	connect(...args) {
		const extensionId =
			typeof args[0] === "string" || args[0] instanceof String
				? args.shift()
				: undefined;
		const connectInfo =
			typeof args[0] === "object" || args[0] instanceof Object
				? args.shift()
				: undefined;
		const port = new MockPort(connectInfo.name);

		this.#onConnect.dispatch(port);

		return port;
	}

	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendNativeMessage
	sendNativeMessage(application, message) {
		// Store messages per application.
		const messages = this.#nativeMessages.has(application)
			? this.#nativeMessages.get(application)
			: [];
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
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port
class MockPort {
	#name;
	#onMessage;

	constructor(name) {
		this.#name = name;
		this.#onMessage = new MockEvent();
	}

	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port#name
	get name() {
		return this.#name;
	}

	postMessage(message) {
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#data_cloning_algorithm
		const data = JSON.parse(JSON.stringify(message));

		this.#onMessage.dispatch(data, this);
	}

	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/Port#onmessage
	get onMessage() {
		return this.#onMessage;
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

test("RPCServer", async (t) => {
	await t.test(
		"adds a listener for runtime.onConnect events on start()",
		(tt) => {
			const browser = new MockBrowser();
			const server = new RPCServer(browser);

			server.start();

			const exp = 1;
			const act = browser.runtime.onConnect.listeners.length;
			tt.assert.strictEqual(act, exp, `expected ${exp} listeners, got ${act}`);
		},
	);

	await t.test(
		"sends a native message upon receiving a request with `ListCommands` method",
		(tt) => {
			const browser = new MockBrowser();
			const server = new RPCServer(browser);

			server.start();

			// Simulate a connection to the server.
			const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
			const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
			const port = browser.runtime.connect(extensionId, { name: portName });

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
			tt.assert.strictEqual(
				act,
				exp,
				`expected ${exp} native messages sent to "dev.sulim.q", got ${act}`,
			);
		},
	);

	await t.test(
		"sends a native message upon receiving a request with `RunCommand` method",
		(tt) => {
			const browser = new MockBrowser();
			const server = new RPCServer(browser);

			server.start();

			// Simulate a connection to the server.
			const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
			const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
			const port = browser.runtime.connect(extensionId, { name: portName });

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
			tt.assert.strictEqual(
				act,
				exp,
				`expected ${exp} native messages sent to "dev.sulim.q", got ${act}`,
			);
		},
	);

	await t.test(
		"does not send any native message upon receiving an RPC method call for unknown command",
		(tt) => {
			const browser = new MockBrowser();
			const server = new RPCServer(browser);

			server.start();

			// Simulate a connection to the server.
			const extensionId = "q@sulim.dev"; // Matches browser_specific_settings.gecko.id from manifest.json
			const portName = "urn:browser-ext:dev.sulim.q:popup"; // The server listens only to connections on ports with this name.
			const port = browser.runtime.connect(extensionId, { name: portName });

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
			tt.assert.strictEqual(
				act,
				exp,
				`expected ${exp} native messages sent to "dev.sulim.q", got ${act}`,
			);
		},
	);

	// TODO: Add tests for each RPC command for onSuccess and onError responses received from the host.
});
