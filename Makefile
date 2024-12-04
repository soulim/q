EXTENSION_DIR = extension
HOST_DIR = host
DST_DIR = dist

VERSION = 0.0.0

.PHONY: release
release: clean
	$(MAKE) --directory=$(EXTENSION_DIR) release VERSION=$(VERSION)
	$(MAKE) --directory=$(HOST_DIR) release-all VERSION=$(VERSION)

	cp $(EXTENSION_DIR)/dist/* $(DST_DIR)
	cp $(HOST_DIR)/dist/* $(DST_DIR)
	mv $(DST_DIR)/*.xpi $(DST_DIR)/q-extension.xpi
	ls -l $(DST_DIR)

	gh release create v$(VERSION) $(DST_DIR)/* \
	                  --draft

.PHONY: all
all:
	$(MAKE) --directory=$(HOST_DIR) all

.PHONY: clean
clean:
	$(MAKE) --directory=$(EXTENSION_DIR) clean
	$(MAKE) --directory=$(HOST_DIR) clean
	rm -rf $(DST_DIR)/*

.PHONY: sharp
sharp: .tool-versions
	$(MAKE) --directory=$(EXTENSION_DIR) sharp
	$(MAKE) --directory=$(HOST_DIR) sharp

.DEFAULT: all
