SRC_DIR = src
DST_DIR = dist
MANIFEST_TMPL = manifest.json.tmpl
MANIFEST_FILE = $(SRC_DIR)/manifest.json
VERSION = 0.0.0

# Defined in the environment and contain credentials to sign the extension.
WEB_EXT_API_KEY ?=
WEB_EXT_API_SECRET ?=

WEB_EXT = node_modules/.bin/web-ext

$(WEB_EXT):
	npm ci

$(MANIFEST_FILE): $(MANIFEST_TMPL)
	export Q_EXTENSION_VERSION=$(VERSION) \
	&& cat $(MANIFEST_TMPL) \
	| envsubst > $(MANIFEST_FILE)
	cat $(MANIFEST_FILE)


$(DST_DIR):
	mkdir -p $@

.PHONY: check
check: $(MANIFEST_FILE)
	$(WEB_EXT) lint --source-dir=$(SRC_DIR) \
	                --self-hosted

.PHONY: preview
preview: check
	$(WEB_EXT) run --source-dir=$(SRC_DIR) \
	               --browser-console \
	               --start-url="https://example.com" \
	               --start-url="about:devtools-toolbox?id=q%40sulim.dev&type=extension" \
	               --start-url="about:debugging#/runtime/this-firefox"

.PHONY: release
release: check | $(DST_DIR)
	$(WEB_EXT) sign --source-dir=$(SRC_DIR) \
	                --artifacts-dir=$(DST_DIR) \
	                --channel=unlisted \
	                --api-key=$(WEB_EXT_API_KEY) \
	                --api-secret=$(WEB_EXT_API_SECRET)

.PHONY: clean
clean:
	rm -rf $(DST_DIR)
	rm -f $(MANIFEST_FILE)

.PHONY: all
all: release

.DEFAULT: all
