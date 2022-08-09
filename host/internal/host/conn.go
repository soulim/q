package host

import "io"

// Conn implements the io.ReadWriter interface.
type Conn struct {
	stdin  io.Reader
	stdout io.Writer
}

// Implementation of the io.ReadWriter interface.

// Read implements the io.ReadWriter Read method.
func (c *Conn) Read(b []byte) (int, error) {
	return 0, nil
}

// Write implements the io.ReadWriter Write method.
func (c *Conn) Write(b []byte) (int, error) {
	return 0, nil
}

func NewConn(stdin io.Reader, stdout io.Writer) *Conn {
	return &Conn{
		stdin: stdin,
		stdout: stdout,
	}
}
