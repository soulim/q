package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
)

func main() {
	// Receive a request

	var message []byte

	if err := receive(os.Stdin, &message); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	fmt.Fprintf(os.Stderr, "message=%q\n", string(message))

	// Execute `id -unr` command and send its output as a response.

	cmd := exec.Command("id", "-unr")

	out, err := cmd.Output()
	if err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	if err := send(os.Stdout, string(out)); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}
}

func receive(r io.Reader, v any) error {
	var length uint32

	if err := binary.Read(r, binary.LittleEndian, &length); err != nil {
		return err
	}

	if err := json.NewDecoder(io.LimitReader(r, int64(length))).Decode(v); err != nil {
		return err
	}

	return nil
}

func send(w io.Writer, v any) error {
	var buf bytes.Buffer

	b, err := json.Marshal(v)
	if err != nil {
		return err
	}

	buf.Write(b)

	if err := binary.Write(w, binary.LittleEndian, uint32(buf.Len())); err != nil {
		return err
	}

	if _, err := buf.WriteTo(w); err != nil {
		return err
	}

	return nil
}
