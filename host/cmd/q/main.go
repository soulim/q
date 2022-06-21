package main

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"

	"github.com/BurntSushi/toml"
	"github.com/soulim/q/host/internal/host"
)

func main() {
	c := &host.Config{}

	if err := loadConfig(c); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
		os.Exit(2)
	}

	// fmt.Fprintf(os.Stderr, "config=%q\n", c)

	h := host.NewHost(c)

	if err := h.Run(os.Stdin, os.Stdout, os.Stderr); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
		os.Exit(1)
	}
}

func loadConfig(c *host.Config) error {
	u, err := user.Current()
	if err != nil {
		return err
	}

	if _, err := toml.DecodeFile(filepath.Join(u.HomeDir, ".config", "q", "config.toml"), c); err != nil {
		return err
	}

	return nil
}
