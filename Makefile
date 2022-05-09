Q_HOST_DIR = $(realpath .)/host
Q_HOST_BIN_DIR = $(Q_HOST_DIR)/bin

$(Q_HOST_BIN_DIR):
	mkdir -p $@

Q_HOST = $(Q_HOST_BIN_DIR)/q
Q_HOST_MANIFEST = $(Q_HOST_DIR)/manifest.json

# See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location
#
# TODO: Change the variable name to something better
Q_HOST_MANIFEST_PATH = $(HOME)/.mozilla/native-messaging-hosts/dev.sulim.q.json

$(Q_HOST): $(Q_HOST_DIR)/*.go | $(Q_HOST_BIN_DIR)
	cd $(Q_HOST_DIR) \
	&& go build -o $@

.PHONY: install-host
install-host: $(Q_HOST) $(Q_HOST_MANIFEST)
	export Q_HOST_PATH=$(abspath $(Q_HOST)) \
	&& cat $(Q_HOST_MANIFEST) \
	| envsubst > $(Q_HOST_MANIFEST_PATH) \
	&& cat $(Q_HOST_MANIFEST_PATH)

.PHONY: build-extension
build-extension:

.PHONY: install-extension
install-extension: build-extension

.PHONY: install
install: install-host install-extension

.PHONY: clean
clean:
	rm -rf $(Q_HOST_BIN_DIR)
	rm -f $(Q_HOST_MANIFEST_PATH)
