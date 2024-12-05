import { Coordinator } from "./coordinator.js";

window.addEventListener("load", function () {
	const coordinator = new Coordinator(this);

	coordinator.start();
});
