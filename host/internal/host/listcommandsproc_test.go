package host_test

import (
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestListCommandsProc_ServeRPC(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		cmds := map[string]host.Command{
			"hello-world": {
				Label:     "Execute echo",
				Command:   "echo",
				Arguments: []string{"Hello, world."},
			},
		}
		proc := host.NewListCommandsProc(cmds)
		req := &host.Request{
			Method:  "ListCommands",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := proc.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}

		result := res.Result.([]host.CommandsListingItem)

		if len(cmds) != len(result) {
			t.Errorf("commands listing length does not match: want = %d, got = %d", len(cmds), len(result))
		}
	})

	t.Run("empty commands list", func(t *testing.T) {
		cmds := map[string]host.Command{}
		proc := host.NewListCommandsProc(cmds)
		req := &host.Request{
			Method:  "ListCommands",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := proc.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}

		result := res.Result.([]host.CommandsListingItem)

		if len(result) != 0 {
			t.Errorf("want an empty commands listing, got = %+v", result)
		}
	})
}
