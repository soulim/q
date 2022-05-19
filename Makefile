Q_EXTENSION_DIR = $(realpath .)/extension
Q_EXTENSION_SRC_DIR = $(Q_EXTENSION_DIR)/src
Q_EXTENSION_DST_DIR = $(Q_EXTENSION_DIR)/dist

Q_HOST_DIR = $(realpath .)/host
Q_HOST_BIN_DIR = $(Q_HOST_DIR)/bin

$(Q_HOST_BIN_DIR):
	mkdir -p $@

Q_HOST = $(Q_HOST_BIN_DIR)/q
Q_HOST_MANIFEST = $(Q_HOST_DIR)/manifest.json

# See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location
Q_HOST_MANIFEST_INSTALL_DIR = $(HOME)/.mozilla/native-messaging-hosts
ifeq ($(shell uname), "Darwin")
  Q_HOST_MANIFEST_INSTALL_DIR = $(HOME)/Library/Application Support/Mozilla/NativeMessagingHosts
endif

Q_HOST_MANIFEST_INSTALL_PATH = $(Q_HOST_MANIFEST_INSTALL_DIR)/dev.sulim.q.json

$(Q_HOST): $(Q_HOST_DIR)/*.go | $(Q_HOST_BIN_DIR)
	cd $(Q_HOST_DIR) \
	&& go build -o $@

.PHONY: check-host
check-host:
	cd $(Q_HOST_DIR) \
	&& go fmt ./... \
	&& go vet ./...

.PHONY: build-host
build-host: check-host $(Q_HOST)

.PHONY: install-host
install-host: build-host $(Q_HOST_MANIFEST)
	export Q_HOST_PATH=$(abspath $(Q_HOST)) \
	&& cat $(Q_HOST_MANIFEST) \
	| envsubst > $(Q_HOST_MANIFEST_INSTALL_PATH) \
	&& cat $(Q_HOST_MANIFEST_INSTALL_PATH)

.PHONY: check-extension
check-extension:
	cd $(Q_EXTENSION_DIR) \
	&& npm run lint

.PHONY: build-extension
build-extension: check-extension
	cd $(Q_EXTENSION_DIR) \
	&& npm run build

.PHONY: install-extension
install-extension: build-extension
	@echo ""
	@echo "TODO: Print installation instructions for the extension"
	@echo ""

.PHONY: install
install: install-host install-extension

.PHONY: clean
clean:
	rm -rf $(Q_HOST_BIN_DIR) \
	       $(Q_EXTENSION_DST_DIR)
