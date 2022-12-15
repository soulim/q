package main

import (
	"fmt"
	"os"
	"os/user"
	"path/filepath"

	"github.com/soulim/q/host/internal/host"
)

func main() {
	// Load configuration.
	// A configuration file is expected to be in $HOME/.config/q/config.toml.
	conf := &host.Config{}

	u, err := user.Current()
	if err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	if err := conf.Load(filepath.Join(u.HomeDir, ".config", "q", "config.toml")); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	// Set up a multiplexer to serve supported RPC methods.
	mux := &host.ServeMux{}

	if err := mux.Register("ListCommands", host.NewListCommandsProc(conf.Commands)); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	if err := mux.Register("RunCommand", host.NewRunCommandProc(conf.Commands)); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	// Set up a server and start serving incoming connections.
	srv := &host.Server{
		Handler: mux,
	}

	if err := srv.ServeConn(host.NewConn(os.Stdin, os.Stdout)); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}
}
