package host_test

import (
	"strings"
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func TestServeMux_Register(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		mux := &host.ServeMux{}
		mux.Register("HelloWorld", &handler{})

		got, err := mux.Handler("HelloWorld")
		if err != nil {
			t.Fatalf("error: %q", err)
		}

		if got == nil {
			t.Errorf("expected a handler, got nil")
		}
	})

	t.Run("when a handler is not registered", func(t *testing.T) {
		mux := &host.ServeMux{}

		_, err := mux.Handler("HelloWorld")
		if err == nil {
			t.Errorf("expected error, got nil")
		}
	})
}

func TestServeMux_Handler(t *testing.T) {
	t.Run("when a handler is registered", func(t *testing.T) {
		mux := &host.ServeMux{}
		mux.Register("HelloWorld", &handler{})

		got, err := mux.Handler("HelloWorld")
		if err != nil {
			t.Fatalf("error: %q", err)
		}

		if got == nil {
			t.Errorf("expected a handler, got nil")
		}
	})

	t.Run("when a handler is not registered", func(t *testing.T) {
		mux := &host.ServeMux{}
		mux.Register("HelloAnotherWorld", &handler{})

		_, err := mux.Handler("HelloWorld")
		if err == nil {
			t.Errorf("expected error, got nil")
		}
	})
}

func TestServeMux_ServeRPC(t *testing.T) {
	t.Run("ok", func(t *testing.T) {
		h := &handler{
			ServeRPCFunc: func(req host.Request, res *host.Response) error {
				res.ID = req.ID

				return nil
			},
		}

		mux := &host.ServeMux{}
		mux.Register("HelloWorld", h)

		req := &host.Request{
			Method:  "HelloWorld",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := mux.ServeRPC(*req, res); err != nil {
			t.Fatalf("error: %q", err)
		}

		// See ServeRPCFunc implementation above to understand these expectations.
		want := req.ID
		got := res.ID

		if strings.Compare(want, got) != 0 {
			t.Errorf("want = %q, got = %q", want, got)
		}
	})

	t.Run("when a handler is not registered", func(t *testing.T) {
		mux := &host.ServeMux{}

		req := &host.Request{
			Method:  "HelloWorld",
			ID:      "rpc-id/xxx",
			Version: "2.0",
		}
		res := &host.Response{}

		if err := mux.ServeRPC(*req, res); err == nil {
			t.Errorf("want error, got = %q", err)
		}
	})
}
