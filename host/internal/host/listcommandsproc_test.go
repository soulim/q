package host_test

import (
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestListCommandsProc_ServeRPC(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		lcp := &host.ListCommandsProc{
			Commands: map[string]host.Command{
				"hello-world": {
					Label:     "Execute echo",
					Command:   "echo",
					Arguments: []string{"Hello, world."},
				},
			},
		}
		req := &host.Request{
			Method:  "ListCommands",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := lcp.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}

		result := res.Result.([]host.CommandsListingItem)

		if len(lcp.Commands) != len(result) {
			t.Errorf("commands listing length does not match: want = %d, got = %d", len(lcp.Commands), len(result))
		}
	})

	t.Run("empty commands list", func(t *testing.T) {
		lcp := &host.ListCommandsProc{
			Commands: map[string]host.Command{},
		}
		req := &host.Request{
			Method:  "ListCommands",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := lcp.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}

		result := res.Result.([]host.CommandsListingItem)

		if len(result) != 0 {
			t.Errorf("want an empty commands listing, got = %+v", result)
		}
	})
}
