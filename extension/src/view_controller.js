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
          false,
        );

        return button;
      }.bind(this),
    );

    this.#listCommandsElement.replaceChildren(...buttons);
  }

  #didClickCommandButton(event) {
    const command = event.currentTarget.dataset;

    this.#viewModel.runCommand(command.id);
  }
}

export { ViewController };
