package host_test

import (
	"bytes"
	"encoding/binary"
	"testing"

	"github.com/soulim/q/host/internal/host"
)

func nativemessage(t *testing.T, m []byte) []byte {
	t.Helper()

	nm := []byte{}

	nm = binary.LittleEndian.AppendUint32(nm, uint32(len(m)))
	nm = append(nm, m...)

	return nm
}

func TestConn_Read(t *testing.T) {
	m := []byte(`{"Method": "HelloWorld"}`)

	stdin := &bytes.Buffer{}
	stdout := &bytes.Buffer{}

	stdin.Write(nativemessage(t, m))

	conn := host.NewConn(stdin, stdout)

	want := m
	got := make([]byte, 24)

	if _, err := conn.Read(got); err != nil {
		t.Fatalf("error %q", err)
	}

	if bytes.Compare(got, want) != 0 {
		t.Errorf("want = %q, got = %q", want, got)
	}
}

func TestConn_Write(t *testing.T) {
	m := []byte(`{"Method": "HelloWorld"}`)

	stdin := &bytes.Buffer{}
	stdout := &bytes.Buffer{}

	conn := host.NewConn(stdin, stdout)

	if _, err := conn.Write(m); err != nil {
		t.Fatalf("error %q", err)
	}

	want := nativemessage(t, m)
	got := stdout.Bytes()

	if bytes.Compare(got, want) != 0 {
		t.Errorf("want = %q, got = %q", want, got)
	}
}
