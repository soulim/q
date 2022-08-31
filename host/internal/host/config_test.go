package host_test

import (
	"path/filepath"
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestConfig_Load(t *testing.T) {
	c := &host.Config{}

	if err := c.Load(filepath.Join("testdata", "config.toml")); err != nil {
		t.Fatalf("err = %q", err)
	}

	if _, ok := c.Commands["hello-world"]; !ok {
		t.Errorf("want 'hello-world' command, got = %q", c.Commands)
	}
}
