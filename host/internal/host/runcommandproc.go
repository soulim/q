package host

type RunCommandProc struct {
	commands map[string]Command
}

func (h *RunCommandProc) ServerRPC(req Request, res *Response) error {
	return nil
}

// NewRunCommandProc return a new RunCommandProc given list of possible
// commands to execute.
func NewRunCommandProc(cmds map[string]Command) *RunCommandProc {
	return &RunCommandProc{
		commands: cmds,
	}
}
