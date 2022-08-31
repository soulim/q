package host

import "github.com/BurntSushi/toml"

// Config hold a configuration.
type Config struct {
	Commands map[string]Command `toml:"commands"`
}

// Load fetches configuration from a TOML file located by the given path.
func (c *Config) Load(path string) error {
	if _, err := toml.DecodeFile(path, c); err != nil {
		return err
	}

	return nil
}
