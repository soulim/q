Q_HOST_DIR = $(realpath .)/host
Q_HOST_BIN_DIR = $(Q_HOST_DIR)/bin
QD = $(Q_HOST_BIN_DIR)/qd

# See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location
Q_HOST_MANIFEST_PATH = $(HOME)/.mozilla/native-messaging-hosts/dev.sulim.q.json

$(Q_HOST_BIN_DIR):
	mkdir -p $@

$(QD): $(Q_HOST_DIR)/*.go
	cd $(Q_HOST_DIR) \
	&& go build -o $@

.PHONY: all
all: $(QD)

PHONY: install
	install:
		export Q_HOST_PATH=$(QD) \
	&& cat manifest.json \
	| envsubst > $(Q_HOST_MANIFEST_PATH)

PHONY: uninstall
uninstall:
	rm $(Q_HOST_MANIFEST_PATH)
