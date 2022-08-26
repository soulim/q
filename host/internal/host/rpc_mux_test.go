package host_test

import (
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestRPCMux_Register(t *testing.T) {
}

func TestRPCMux_ServeRPC(t *testing.T) {
	mux := &host.RPCMux{}

	h := &handler{
		ServeRPCFunc: func(req host.Request, res *host.Response) error {
			return nil
		},
	}

	mux.Register("HelloWorld", h)

	t.Run("ok", func(t *testing.T) {
		req := &host.Request{
			Method:  "HelloWorld",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := mux.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}
	})
	t.Run("when a handler is not defined", func(t *testing.T) {
	})
}
