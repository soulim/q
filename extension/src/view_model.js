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

    return [];
  }

  // TODO: Add documentation.
  runCommand(commandID) {
    const callback = function (_response) {
      if (this.#coordinatorDelegate === undefined) return;

      this.#coordinatorDelegate.viewModelDidFinish();
    }.bind(this);

    this.#model.runCommand(commandID, callback);
  }
}

export { ViewModel };
