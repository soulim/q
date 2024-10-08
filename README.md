# Q

![Screenshot][q-screenshot]

Q is a browser extension that allows to run external commands and process open
pages. It's better explained on examples in the background section below.

## Background

Q started from an idea of keeping browser bookmarks as notes in Obsidian. I
keep my personal notes in plain text files (formatted with Markdown) and use
[Obsidian](https://obsidian.md/) to work with them. So having notes pages as
`bookmark` sounded as a great idea. To achieve that it was necessary to simply
save a URL of a browser tab in a plain text file. Easy? Nope!

As I learned, browsers are very isolated environments. That makes total sense
because no one wants some JavaScript code loaded on a random page doing some
crazy things on a local disk. Therefore, it isn't easy to simply save a URL in a
plain text file.

During my research I discovered "hackable" browsers like
[qutebrowser](https://qutebrowser.org/), [luakit](https://luakit.github.io/),
[Nyxt](https://nyxt.atlas.engineer/). They allow not only have keyboard
navigation, but also process pages with external scripts. That was exactly what
was necessary because at that point I wanted not only save bookmark notes, but
be able to do anything I want with pages using my scripts.

Unfortunately none of "hackable" browsers worked well for me (some have
annoying bugs, some don't work all platforms I use, and so on). They all great,
but not for me. Therefore, I kept doing research and discovered [the
WebExtensions
API][webextensions-api].
It allows to create add-ons that work for all major browsers and it's a
standard. That was a starting point for Q.

### Why it's called "Q"?

> Q is a fictional character, as well as the name of a race, in Star Trek. ...
> He is an extra-dimensional being of unknown origin who possesses immeasurable
> power over time, space, the laws of physics, and reality itself, being
> capable of altering it to his whim.
>
> [Wikipedia](<https://en.wikipedia.org/wiki/Q_(Star_Trek)>)

Q gives you immeasurable power over pages loaded in the browser. Use it
responsibly :wink:

### How it works

Q isn't just a browser extension. It's tiny eco-system consisting of the
following components:

  1. The browser extension (add-on).
  2. The host application.
  3. A configuration file.
  4. Scripts, or better to say executables, *you* write to do anything *you* like
   with URLs and pages received from the browser.

The extension does nothing more than provides a human-friendly interface to
talk to the host application.

The host application is there to serve a list of possible commands to execute,
and to run a selected command at *your* order. At runtime each command has
access to following environment variables provided by the host:

  - `Q_PAGE_URL`, a URL of the page
  - `Q_PAGE_HTML`, a path to temporary file containing source code of the page

You define all available commands in a configuration file. See the
configuration section below for all details.

If you script or executable sends something to the standard output stream
(STDOUT), Q displays that using notifications. That could be useful for example
in cases of long running scripts when you would like to be notified about
finished operation. However it's totally up to you to decide whether it makes
sense to display any notification or not. Q isn't going to be "smart" to decide
on that for you. It's designed to assist, but never stay on your way.

**NOTE:** by design Q *cannot* execute any random code or run any arbitrary
app or script available on your machine. It operates only on what *you* define
as possible in its configuration.

## Install

1. From [the latest release](https://github.com/soulim/q/releases/latest):

    - Download, extract, and place somewhere (for example `$HOME/.local/bin`) the host binary
    - Install the extension by opening its file with Firefox

2. Using the following template create a manifest file for the native messaging host and place in:

    - Linux: `$(HOME)/.mozilla/native-messaging-hosts`
    - macOS: `$(HOME)/Library/Application\ Support/Mozilla/NativeMessagingHosts`

    ```json
    {
      "name": "dev.sulim.q",
      "description": "Q is a browser extension that allows you to process web pages with external commands.",
      "path": "<ABSOLUTE_PATH_TO_Q_HOST_BINARY>",
      "type": "stdio",
      "allowed_extensions": [ "q@sulim.dev" ]
    }
    ```

3. Create a configuration file with commands you would like to execute using Q. See the configuration section below.

## Usage

TODO: Add usage instructions

### Configuration

Configuration should be defined in `$HOME/.config/q/config.toml`. This file
contains a table of available commands.

Example:

```toml
[commands.bookmark]
label = "Save as a bookmark note"
command = "/home/soulim/.local/share/q/bin/add-bookmark-note"

[commands.demo-script]
label = "Run a demo script "
command = "/home/soulim/.local/share/q/bin/demo"
```

NOTE: `command` keys must use absolute paths to executables as their values.

## Architecture

The architecture of Q is based and highly influenced by the [WebExtensions
APIs][webextensions-api]. There are two main components:

1. the browser extension (or add-on),
2. the host application.

The user interacts with the extension in the browser. The extension doesn't
have direct access to the host application, but communicates with it via the
[native messaging][native-messaging] interface provided by the browser. The
host application runs external commands or scripts, but only those defined by
the user (see configuration below).

![System context diagram][diagram-system-context]

### Command execution flow

![Command execution flow][diagram-command-execution]

### Security

  - The extension never communicates directly with the host. The communication is controlled by the browser.
  - The extension cannot send any arbitrary command to the host to execute. In other words, it cannot request to execute `rm -rf /`.
  - The extension does not have access to the list of configured commands. It "knows" all commands only by their IDs.

## Contributing

Q is open to code contributions for bug fixes only. As features might carry a
long-term maintenance burden, they will not be accepted at this time. Please
[submit an issue](https://github.com/soulim/q/issues) if you have a feature you
would like to request.

## License

Copyright (c) 2022 Alexander Sulim

Q is free software: you can redistribute it and/or modify it under the terms of
the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

See [COPYING](COPYING) for license text.

[webextensions-api]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_support_for_JavaScript_APIs
[native-messaging]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
[diagram-system-context]: docs/context.puml.png
[diagram-command-execution]: docs/command-execution.puml.png
[q-screenshot]: docs/q-screenshot.png
