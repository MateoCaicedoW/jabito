package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"
)

type store struct {
	path string
	mu   sync.Mutex
}

func (s *store) load() (State, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		return State{Habits: []Habit{}, Completions: map[string][]string{}}, nil
	}
	if err != nil {
		return State{}, err
	}
	var state State
	if err := json.Unmarshal(data, &state); err != nil {
		return State{}, err
	}
	if state.Habits == nil {
		state.Habits = []Habit{}
	}
	if state.Completions == nil {
		state.Completions = map[string][]string{}
	}
	return state, nil
}

func (s *store) save(state State) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if err := os.MkdirAll(filepath.Dir(s.path), 0755); err != nil {
		return err
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}
	temp := s.path + ".tmp"
	if err := os.WriteFile(temp, data, 0600); err != nil {
		return err
	}
	if err := os.Rename(temp, s.path); err != nil {
		_ = os.Remove(temp)
		return err
	}
	return nil
}
