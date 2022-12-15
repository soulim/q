package host

import "sort"

type CommandsListingItem struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

// ListCommandsProc is a handler for "ListCommands" RPC method.
type ListCommandsProc struct {
	commandsListing []CommandsListingItem
}

// ServeRPC implements host.Handler interface.
func (h *ListCommandsProc) ServeRPC(req Request, res *Response) error {
	res.Result = h.commandsListing

	return nil
}

func NewListCommandsProc(cmds map[string]Command) *ListCommandsProc {
	// Sort commands by IDs. Otherwise the list of the same commands
	// might have different order and that looks confusing.
	ids := make([]string, 0, len(cmds))
	for id := range cmds {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	listing := []CommandsListingItem{}

	for _, id := range ids {
		listing = append(listing, CommandsListingItem{
			ID:    id,
			Label: cmds[id].Label,
		})
	}

	return &ListCommandsProc{
		commandsListing: listing,
	}
}
