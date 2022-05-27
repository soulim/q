Q_EXTENSION_DIR = $(realpath .)/extension
Q_EXTENSION_SRC_DIR = $(Q_EXTENSION_DIR)/src
Q_EXTENSION_DST_DIR = $(Q_EXTENSION_DIR)/dist
Q_EXTENSION_VERSION = 0.0.0

Q_HOST_DIR = $(realpath .)/host
Q_HOST_BIN_DIR = $(Q_HOST_DIR)/bin

$(Q_HOST_BIN_DIR):
	mkdir -p $@

Q_HOST = $(Q_HOST_BIN_DIR)/q
Q_HOST_MANIFEST = $(Q_HOST_DIR)/manifest.json

# See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location
Q_HOST_MANIFEST_INSTALL_DIR = $(HOME)/.mozilla/native-messaging-hosts
ifeq ($(shell uname -s), Darwin)
  Q_HOST_MANIFEST_INSTALL_DIR = $(HOME)/Library/Application\ Support/Mozilla/NativeMessagingHosts
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

.PHONY: host-check
host-check:
	cd $(Q_HOST_DIR) \
	&& go fmt ./... \
	&& go vet ./...

.PHONY: host-build
host-build: host-check $(Q_HOST)

.PHONY: host-install
host-install: host-build $(Q_HOST_MANIFEST)
	export Q_HOST_PATH=$(abspath $(Q_HOST)) \
	&& cat $(Q_HOST_MANIFEST) \
	| envsubst > $(Q_HOST_MANIFEST_INSTALL_PATH) \
	&& cat $(Q_HOST_MANIFEST_INSTALL_PATH)

.PHONY: extension-check
extension-check:
	$(WEB_EXT) lint --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                --self-hosted

.PHONY: extension-preview
extension-preview: extension-check
	$(WEB_EXT) run --source-dir=$(Q_EXTENSION_SRC_DIR) \
	               --browser-console \
	               --start-url="https://example.com" \
	               --start-url="about:devtools-toolbox?id=q%40sulim.dev&type=extension" \
	               --start-url="about:debugging#/runtime/this-firefox"

.PHONY: extension-build
extension-build: extension-check
	$(WEB_EXT) build --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                 --artifacts-dir=$(Q_EXTENSION_DST_DIR) \
					 --filename=q-$(Q_EXTENSION_VERSION).zip \
	                 --overwrite-dest

.PHONY: extension-release
extension-release: extension-check
	$(WEB_EXT) sign --source-dir=$(Q_EXTENSION_SRC_DIR) \
	                --artifacts-dir=$(Q_EXTENSION_DST_DIR) \
	                --channel=unlisted \
	                --api-key=$(WEB_EXT_API_KEY) \
	                --api-secret=$(WEB_EXT_API_SECRET)

.PHONY: extension-install
extension-install:
	@echo ""
	@echo "TODO: Print installation instructions for the extension"
	@echo ""

.PHONY: install
install: host-install extension-install

.PHONY: clean
clean:
	rm -rf $(Q_HOST_BIN_DIR) \
	       $(Q_EXTENSION_DST_DIR)
