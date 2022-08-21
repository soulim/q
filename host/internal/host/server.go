package host

import (
	"bufio"
	"encoding/json"
	"io"
)

// Handler interface expected by Server.
type Handler interface {
	ServeRPC(Request, *Response) error
}

// Server serves incoming connections by passing them to
// the configured Handler.
type Server struct{
	Handler Handler
}

// ServeConn handles one incoming connection.
func (s *Server) ServeConn(conn io.ReadWriter) error {
	req := &Request{}

	if err := s.readRequest(conn, req); err != nil {
		return err
	}

	res := &Response{
		ID: req.ID,
		Version: req.Version,
	}

	if err := s.Handler.ServeRPC(*req, res); err != nil {
		return err
	}

	if err := s.writeResponse(conn, res); err != nil {
		return err
	}

	return nil
}

func (s *Server) readRequest(conn io.ReadWriter, req *Request) error {
	bufr := bufio.NewReader(conn)
	dec := json.NewDecoder(bufr)

	return dec.Decode(req)
}

func (s *Server) writeResponse(conn io.ReadWriter, res *Response) error {
	enc := json.NewEncoder(conn)

	return enc.Encode(res)
}
