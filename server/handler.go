package main

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
)

func newHandler(path string) http.Handler {
	s := &store{path: path}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/state", s.getState)
	mux.HandleFunc("PUT /api/state", s.putState)
	mux.Handle("/", http.FileServer(http.Dir("dist")))
	return mux
}

func (s *store) getState(w http.ResponseWriter, _ *http.Request) {
	state, err := s.load()
	if err != nil {
		http.Error(w, "Could not read saved progress", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, state)
}

func (s *store) putState(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var state State
	if err := decoder.Decode(&state); err != nil {
		http.Error(w, "Invalid state", http.StatusBadRequest)
		return
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		http.Error(w, "Invalid state", http.StatusBadRequest)
		return
	}
	if err := validate(state); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if state.Habits == nil {
		state.Habits = []Habit{}
	}
	if state.Completions == nil {
		state.Completions = map[string][]string{}
	}
	if err := s.save(state); err != nil {
		http.Error(w, "Could not save progress", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, state)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
