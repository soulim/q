package host

import (
	"fmt"
	"sync"
)

// ServeMux is an RPC request multiplexer.
// It matches the method of each incoming request against the list of registered
// patterns and calls the handler/procedure/proc for the pattern that matches
// the method.
type ServeMux struct {
	mu sync.RWMutex
	m map[string]Handler
}

// Register registers a handler for an RPC request by given method.
func (mux *ServeMux) Register(method string, handler Handler) error {
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

// ServeRPC implements host.Handler interface.
func (mux *ServeMux) ServeRPC(req Request, res *Response) error {
	h, err := mux.Handler(req.Method)

	if err != nil {
		return err
	}

	return h.ServeRPC(req, res)
}

// Handler returns an RPC handler registered by given method name.
func (mux *ServeMux) Handler(method string) (Handler, error) {
	mux.mu.RLock()
	defer mux.mu.RUnlock()

	h, exists := mux.m[method]

	if !exists {
		return nil, fmt.Errorf("cannot find handler for method %q", method)
	}

	return h, nil
}

