Q_EXTENSION_DIR = extension
Q_HOST_DIR = host

.PHONY: release
release:
	$(MAKE) --directory=$(Q_EXTENSION_DIR) release
	$(MAKE) --directory=$(Q_HOST_DIR) release-all

.PHONY: all
all:
	$(MAKE) --directory=$(Q_HOST_DIR) all

.PHONY: clean
clean:
	$(MAKE) --directory=$(Q_EXTENSION_DIR) clean
	$(MAKE) --directory=$(Q_HOST_DIR) clean

.DEFAULT: all
