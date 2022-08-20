package host

import (
	"encoding/binary"
	"io"
)

// Conn implements the io.ReadWriter interface.
type Conn struct {
	stdin  io.Reader
	stdout io.Writer
}

// Implementation of the io.ReadWriter interface.

// Read implements the io.ReadWriter Read method. It reads from the input
// stream and treats the incoming data as a native message received from
// a browser.
func (c *Conn) Read(p []byte) (int, error) {
	// Read the length of the incoming message.
	var length uint32

	if err := binary.Read(c.stdin, binary.LittleEndian, &length); err != nil {
		return 0, err
	}

	// Read the incoming message.
	lr := io.LimitReader(c.stdin, int64(length))
	n, err := lr.Read(p)

	return n, err
}

// Write implements the io.ReadWriter Write method. It writes to the output
// stream in the native message format.
func (c *Conn) Write(b []byte) (int, error) {
	nm := []byte{}

	// Prepend the outgoing message with its size.
	nm = binary.LittleEndian.AppendUint32(nm, uint32(len(b)))
	nm = append(nm, b...)

	n, err := c.stdout.Write(nm)

	return n, err
}

func NewConn(stdin io.Reader, stdout io.Writer) *Conn {
	return &Conn{
		stdin:  stdin,
		stdout: stdout,
	}
}
