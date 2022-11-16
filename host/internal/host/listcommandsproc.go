package host

import "sort"

type CommandsListingItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

// ListCommandsProc is a handler for "ListCommands" RPC method.
type ListCommandsProc struct {
	Commands map[string]Command
}

// ServeRPC implements host.Handler interface.
func (h *ListCommandsProc) ServeRPC(req Request, res *Response) error {
	// Sort commands by IDs.
	// Otherwise the list of the same commands might have different order
	// and that looks confusing.
	ids := make([]string, 0, len(h.Commands))
	for id := range h.Commands {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	var result []CommandsListingItem

	for _, id := range ids {
		result = append(result, CommandsListingItem{
			ID:    id,
			Label: h.Commands[id].Label,
		})
	}

	res.Result = result

	return nil
}
