package host_test

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"testing"

	"github.com/soulim/q/host/internal/host"
)

type nativemessage struct {
	header uint32
	body   json.RawMessage
	raw    []byte
}

func newNativemessage(v any) *nativemessage {
}

func (nm *nativemessage) bytes() ([]byte, error) {
	data, err := json.Marshal(nm.body)
	if err != nil {
		return nil, err
	}

	buf := &bytes.Buffer{}

	if err := binary.Write(buf, binary.LittleEndian, uint32(len(data))); err != nil {
		return nil, err
	}

	buf.Write(data)

	return buf.Bytes(), err
}

func TestConn_Read(t *testing.T) {
	req := &host.Request{Method: "HelloWorld"}

	t.Run("ok", func(t *testing.T) {
		stdin := &bytes.Buffer{}
		stdout := &bytes.Buffer{}
		nm := &nativemessage{body: req}

		payload, err := nm.bytes()
		if err != nil {
			t.Fatalf("error %q", err)
		}

		stdin.Write(payload)

		conn := host.NewConn(stdin, stdout)

		want := nm.body
		got := []byte{}
		_, err = conn.Read(got)
		if err != nil {
			t.Fatalf("error %q", err)
		}

		if bytes.Compare(got, want) != 0 {
			t.Errorf("want = %q, got = %q", want, got)
		}
	})
}

func TestConn_Write(t *testing.T) {}
