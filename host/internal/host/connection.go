package host

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"io"
)

type Connection struct {
	in io.Reader
	out io.Writer
}

// Read reads an incoming message from the input stream and decodes it as JSON.
func (c *Connection) Read(v any) error {
	var length uint32

	// Read the length of the incoming message.
	if err := binary.Read(c.in, binary.LittleEndian, &length); err != nil {
		return err
	}

	// Read the incoming message and decode it as JSON.
	if err := json.NewDecoder(io.LimitReader(c.in, int64(length))).Decode(v); err != nil {
		return err
	}

	return nil
}

func (c *Connection) Send(v any) error {
	var buf bytes.Buffer

	msg, err := json.Marshal(v)
	if err != nil {
		return err
	}

	buf.Write(msg)

	// Send the length of the outgoing message.
	if err := binary.Write(c.out, binary.LittleEndian, uint32(buf.Len())); err != nil {
		return err
	}

	// Send the message.
	if _, err := buf.WriteTo(c.out); err != nil {
		return err
	}

	return nil
}

func NewConnection(in io.Reader, out io.Writer) *Connection {
	return &Connection{
		in: in,
		out: out,
	}
}
