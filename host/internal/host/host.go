package host

import (
	"encoding/json"
	"io"
)

type Request struct {
	ID      string   `json:"id"`
	Method  string   `json:"method"`
	Params  []string `json:"params"`
	Version string   `json:"jsonrpc"`
}

type Response struct {
	ID      string `json:"id"`
	Result  any    `json:"result"`
	Version string `json:"jsonrpc"`
}

type Server struct{}

func (s *Server) ServeConn(conn io.ReadWriter) error {
	req := &Request{}

	if err := s.readRequest(conn, req); err != nil {
		return err
	}

	// Call req.Method

	res := &Response{}

	if err := s.writeResponse(conn, res); err != nil {
		return err
	}

	return nil
}

func (s *Server) readRequest(conn io.ReadWriter, req *Request) error {
	dec := json.NewDecoder(conn)

	return dec.Decode(req)
}

func (s *Server) writeResponse(conn io.ReadWriter, res *Response) error {
	enc := json.NewEncoder(conn)

	return enc.Encode(res)
}
