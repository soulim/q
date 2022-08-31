package host

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

type Command struct {
	Arguments []string `json:"arguments"`
	Command   string   `json:"command"`
	Label     string   `json:"label"`
}
