package main

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

type RPCRequest struct {
	Version string   `json:"jsonrpc"`
	Method  string   `json:"method"`
	Params  []string `json:"params"`
	ID      string   `json:"id"`
}

type RPCResponse struct {
	Version string `json:"jsonrpc"`
	Result  any    `json:"result"`
	ID      string `json:"id"`
}

type Command struct {
	Label     string   `json:"label"`
	Command   string   `json:"command"`
	Arguments []string `json:"arguments"`
}

type Config struct {
	Commands map[string]Command `toml:"commands"`
}

func main() {
	u, err := user.Current()
	if err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	var config Config

	if _, err := toml.DecodeFile(filepath.Join(u.HomeDir, ".config", "q", "config.toml"), &config); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	fmt.Fprintf(os.Stderr, "config=%q\n", config)
	var req RPCRequest

	if err := receive(os.Stdin, &req); err != nil {
		fmt.Fprintf(os.Stderr, "err=%v\n", err)
	}

	fmt.Fprintf(os.Stderr, "req=%q\n", req)

	switch req.Method {
	case "ListCommands":
		type ResponseCommand struct {
			ID    string `json:"id"`
			Label string `json:"label"`
		}

		var result []ResponseCommand

		for k, v := range config.Commands {
			result = append(result, ResponseCommand{
				ID:    k,
				Label: v.Label,
			})
		}

		res := RPCResponse{
			Version: "2.0",
			Result:  result,
			ID:      req.ID,
		}

		if err := send(os.Stdout, res); err != nil {
			fmt.Fprintf(os.Stderr, "err=%v\n", err)
		}
	case "RunCommand":
		command, ok := config.Commands[req.Params[0]]
		if !ok {
			fmt.Fprintf(os.Stderr, "err=missing command %v\n", req.Params[0])
		}

		cmd := exec.Command(command.Command, command.Arguments...)
		cmd.Env = append(os.Environ(),
			fmt.Sprintf("Q_PAGE_URL=%s", req.Params[1]),
			// macOS has a limit of 256KB for a command line. Therefore, page HTML and text should be
			// stored as temporary files and their paths set to Q_PAGE_HTML and Q_PAGE_TEXT.
			// Temporary files should be removed after the command execution.
			// fmt.Sprintf("Q_PAGE_HTML=%q", req.Params[2]),
			// fmt.Sprintf("Q_PAGE_TEXT=%q", req.Params[3]),
		)

		out, err := cmd.Output()
		if err != nil {
			fmt.Fprintf(os.Stderr, "err=%v\n", err)
		}

		res := RPCResponse{
			Version: "2.0",
			Result:  string(out),
			ID:      req.ID,
		}

		if err := send(os.Stdout, res); err != nil {
			fmt.Fprintf(os.Stderr, "err=%v\n", err)
		}
	default:
		fmt.Fprintf(os.Stderr, "err=unknown RPC method %v\n", req.Method)
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
