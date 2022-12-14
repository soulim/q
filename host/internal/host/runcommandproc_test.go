package host_test

import (
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestRunCommandProc_ServeRPC(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		cmds := map[string]host.Command{
					"hello-world": {
						Label:     "Execute echo",
						Command:   "echo",
						Arguments: []string{"Hello, world."},
					},
				}
		proc := host.NewRunCommandProc(cmds)
		req := &host.Request{
			Method:  "RunCommand",
			ID:      "rpc-id/xxx",
			Params: []string{"hello-world"},
			Version: "2.0",
		}
		res := &host.Response{}

		if err := proc.ServerRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}
	})
	t.Run("command does not exist", func(t *testing.T) {
		cmds := map[string]host.Command{
					"hello-world": {
						Label:     "Execute echo",
						Command:   "echo",
						Arguments: []string{"Hello, world."},
					},
				}
		proc := host.NewRunCommandProc(cmds)
		req := &host.Request{
			Method:  "RunCommand",
			ID:      "rpc-id/xxx",
			Params: []string{"hallo-welt"},
			Version: "2.0",
		}
		res := &host.Response{}

		if err := proc.ServerRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}
	})
	t.Run("command returns an error", func(t *testing.T) {
	})
}
