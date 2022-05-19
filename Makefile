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

# Defined in the environment and contain credentials to sign the extension.
WEB_EXT_API_KEY ?=
WEB_EXT_API_SECRET ?=

WEB_EXT=$(Q_EXTENSION_DIR)/node_modules/.bin/web-ext

$(WEB_EXT):
	cd $(Q_EXTENSION_DIR) \
	&& npm ci

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
	$(WEB_EXT) lint --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                --self-hosted

.PHONY: build-extension
build-extension: check-extension
	$(WEB_EXT) build --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                 --artifacts-dir=$(Q_EXTENSION_DST_DIR) \
	                 --overwrite-dest

.PHONY: sign-extension
sign-extension: build-extension
	$(WEB_EXT) sign --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                --artifacts-dir=$(Q_EXTENSION_DST_DIR) \
	                --channel=unlisted \
	                --api-key=$(WEB_EXT_API_KEY) \
	                --api-secret=$(WEB_EXT_API_SECRET)

.PHONY: preview
preview: check-extension
	$(WEB_EXT) run --source-dir=$(Q_EXTENSION_SRC_DIR) \
	               --browser-console \
	               --start-url="https://example.com" \
	               --start-url="about:devtools-toolbox?id=q%40sulim.dev&type=extension" \
	               --start-url="about:debugging#/runtime/this-firefox"

.PHONY: install-extension
install-extension: sign-extension
	@echo ""
	@echo "TODO: Print installation instructions for the extension"
	@echo ""

.PHONY: install
install: install-host install-extension

.PHONY: clean
clean:
	rm -rf $(Q_HOST_BIN_DIR) \
	       $(Q_EXTENSION_DST_DIR)
