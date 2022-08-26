package host_test

import (
	"bytes"
	"testing"

	"github.com/soulim/q/host/internal/host"
)

type handler struct {
	ServeRPCFunc func(host.Request, *host.Response) error
}

func (h *handler) ServeRPC(req host.Request, res *host.Response) error {
	if h.ServeRPCFunc != nil {
		return h.ServeRPCFunc(req, res)
	}

	return nil
}

func TestServer_ServeConn(t *testing.T) {
	m := []byte(`{"method": "HelloWorld", "id": "rpc-id/xxx", "jsonrpc": "2.0"}`)

	stdin := &bytes.Buffer{}
	stdout := &bytes.Buffer{}

	stdin.Write(nativemessage(t, m))

	conn := host.NewConn(stdin, stdout)

	s := &host.Server{
		Handler: &handler{},
	}

	if err := s.ServeConn(conn); err != nil {
		t.Fatalf("error %q", err)
	}

	want := nativemessage(t, []byte("{\"id\":\"rpc-id/xxx\",\"result\":null,\"jsonrpc\":\"2.0\"}\n"))
	got := stdout.Bytes()

	if bytes.Compare(got, want) != 0 {
		t.Errorf("want = %q, got = %q", want, got)
	}
}
