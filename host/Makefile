SRC_DIR = .
DST_DIR = dist
BIN_DIR = bin
CMD_DIR = cmd/q

Q = $(BIN_DIR)/q

# See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#manifest_location
MANIFEST_DIR = $(HOME)/.mozilla/native-messaging-hosts
ifeq ($(shell uname -s), Darwin)
  MANIFEST_DIR = $(HOME)/Library/Application\ Support/Mozilla/NativeMessagingHosts
endif

MANIFEST_FILE = $(MANIFEST_DIR)/dev.sulim.q.json
MANIFEST_TMPL = $(SRC_DIR)/manifest.json.tmpl

$(BIN_DIR):
	mkdir -p $@

$(DST_DIR):
	mkdir -p $@

$(Q): $(shell find $(SRC_DIR) -type "f" -name "*.go" ! -name "*_test.go") | $(BIN_DIR)
	go build -o $@ ./$(CMD_DIR)

.PHONY: check
check:
	go fmt ./...
	go vet ./...
	go test ./...

.PHONY: install
install: $(Q) $(MANIFEST_TMPL)
	export Q_HOST_PATH=$(abspath $(Q)) \
	&& cat $(MANIFEST_TMPL) \
	| envsubst > $(MANIFEST_FILE)
	cat $(MANIFEST_FILE)

.PHONY: uninstall
uninstall:
	rm $(MANIFEST_FILE)

.PHONY: release-linux-amd64
release-linux-amd64: | $(DST_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o $(DST_DIR)/q ./$(CMD_DIR)
	tar --create \
	    --gzip \
	    --directory=$(DST_DIR) \
	    --file=$(DST_DIR)/q-host-linux-amd64.tar.gz \
	    q
	rm $(DST_DIR)/q

.PHONY: release-darwin-amd64
release-darwin-amd64: | $(DST_DIR)
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o $(DST_DIR)/q ./$(CMD_DIR)
	tar --create \
	    --gzip \
	    --directory=$(DST_DIR) \
	    --file=$(DST_DIR)/q-host-darwin-amd64.tar.gz \
	    q
	rm $(DST_DIR)/q

.PHONY: release-all
release-all:
	$(MAKE) release-linux-amd64
	$(MAKE) release-darwin-amd64
	ls -l $(DST_DIR)

.PHONY: clean
clean:
	rm -rf $(BIN_DIR)
	rm -rf $(DST_DIR)

.PHONY: sharp
sharp: go.mod
	go mod edit -go=$$(asdf current golang 2>&1 | awk '{print $$2}')
	go mod download

.PHONY: all
all: check $(Q)

.DEFAULT: all
