package host

import (
	"fmt"
	"sync"
)

type RPCMux struct {
	mu sync.RWMutex
	m  map[string]Handler
}

func (mux *RPCMux) Register(method string, handler Handler) error {
	mux.mu.Lock()
	defer mux.mu.Unlock()

	if _, exists := mux.m[method]; exists {
		return fmt.Errorf("multiple registrations for method %q", method)
	}

	if mux.m == nil {
		mux.m = make(map[string]Handler)
	}

	mux.m[method] = handler

	return nil
}

func (mux *RPCMux) ServeRPC(req Request, res *Response) error {
	h, err := mux.handler(&req)

	if err != nil {
		return err
	}

	return h.ServeRPC(req, res)
}

func (mux *RPCMux) handler(req *Request) (Handler, error) {
	mux.mu.RLock()
	defer mux.mu.RUnlock()

	h, exists := mux.m[req.Method]

	if !exists {
		return nil, fmt.Errorf("cannot find handler for method %q", req.Method)
	}

	return h, nil
}
