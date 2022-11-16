package main

func main() {
	// conf := &host.Config{}
	// if err := loadConfig(conf); err != nil {
	// 	fmt.Fprintf(os.Stderr, "err=%v\n", err)
	// }
	//
	// mux := &host.RPCMux{}
	//
	// if err := mux.Register("ListCommands", &host.ListCommandsHandler{Commands: conf.Commands}); err != nil {
	// 	fmt.Fprintf(os.Stderr, "err=%v\n", err)
	// }
	//
	// srv := &host.Server{
	// 	Handler: mux,
	// }
	//
	// if err := srv.ServeConn(host.NewConn(os.Stdin, os.Stdout)); err != nil {
	// 	fmt.Fprintf(os.Stderr, "err=%v\n", err)
	// }
}

// func loadConfig(conf *host.Config) error {
// 	u, err := user.Current()
// 	if err != nil {
// 		return err
// 	}
//
// 	return conf.Load(filepath.Join(u.HomeDir, ".config", "q", "config.toml"))
// }
