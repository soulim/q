import { ViewController } from "./view_controller.js";
import { ViewModel } from "./view_model.js";
import { Model } from "./model.js";

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

export { Coordinator };
