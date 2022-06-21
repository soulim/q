package host

import "io"

type Command struct {
	Label     string   `json:"label"`
	Command   string   `json:"command"`
	Arguments []string `json:"arguments"`
}

type Config struct {
	Commands map[string]Command `toml:"commands"`
}

type Host struct {
	config *Config
}

func (h * Host) Run(stdin io.Reader, stdout io.Writer, stderr io.Writer) error {
	conn := NewConnection(stdin, stdout, stderr)

	req := &Request{}
	if err := conn.Read(req); err != nil {
		return err
	}

	res := &Response{}
	if err := h.Serve(req, res); err != nil {
		return err
	}

	if err := conn.Write(res); err != nil {
		return err
	}

	return nil
}

func NewHost(c *Config) *Host {
	return &Host{
		config: c,
	}
}
