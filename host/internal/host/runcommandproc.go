package host

import (
	"fmt"
	"os"
	"os/exec"
)

type RunCommandProc struct {
	commands map[string]Command
}

func (h *RunCommandProc) ServeRPC(req Request, res *Response) error {
	command, exists := h.commands[req.Params[0]]
	if !exists {
		return fmt.Errorf("cannot find command with label %q", req.Params[0])
	}
	// Save received HTML source code into a temporary file.
	tmpHTML, err := os.CreateTemp("", "q-page-*.html")
	if err != nil {
		return fmt.Errorf("cannot create a temporary file to store received HTML source, error %q", err)
	}
	defer os.Remove(tmpHTML.Name())

	if _, err := tmpHTML.Write([]byte(req.Params[2])); err != nil {
		return fmt.Errorf("cannot write received HTML source to a temporary file, error %q", err)
	}
	if err := tmpHTML.Close(); err != nil {
		return fmt.Errorf("cannot close a temporary file where received HTML source is stored, error %q", err)
	}

	// Execute the command
	cmd := exec.Command(command.Command, command.Arguments...)
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("Q_PAGE_URL=%s", req.Params[1]),
		// macOS has a limit of 256KB for a command line.
		// Therefore, HTML source code of the page is stored
		// in a temporary file and its path set to Q_PAGE_HTML
		// environment variable. The temporary file is available
		// only during command execution.
		fmt.Sprintf("Q_PAGE_HTML=%s", tmpHTML.Name()),
	)

	out, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("cannot execute the command, error %q", err)
	}

	res.Result = string(out)

	return nil
}

// NewRunCommandProc returns a new RunCommandProc given list of possible
// commands to execute.
func NewRunCommandProc(cmds map[string]Command) *RunCommandProc {
	return &RunCommandProc{
		commands: cmds,
	}
}
