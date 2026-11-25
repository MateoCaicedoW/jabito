package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestStateCanBeSavedAndLoaded(t *testing.T) {
	handler := newHandler(t.TempDir() + "/state.json")
	body := `{"habits":[{"id":"walk","name":"Walk","emoji":"🚶","color":"#A7C7E7","createdAt":"2026-11-25"}],"completions":{"walk":["2026-11-25"]}}`

	put := httptest.NewRequest(http.MethodPut, "/api/state", strings.NewReader(body))
	putResult := httptest.NewRecorder()
	handler.ServeHTTP(putResult, put)
	if putResult.Code != http.StatusOK {
		t.Fatalf("PUT status = %d, want 200: %s", putResult.Code, putResult.Body)
	}

	get := httptest.NewRequest(http.MethodGet, "/api/state", nil)
	getResult := httptest.NewRecorder()
	handler.ServeHTTP(getResult, get)
	var state State
	if err := json.Unmarshal(getResult.Body.Bytes(), &state); err != nil {
		t.Fatal(err)
	}
	if len(state.Habits) != 1 || state.Habits[0].Name != "Walk" || len(state.Completions["walk"]) != 1 {
		t.Fatalf("loaded state = %+v, want saved habit and completion", state)
	}
}

func TestStateRejectsInvalidHabit(t *testing.T) {
	handler := newHandler(t.TempDir() + "/state.json")
	req := httptest.NewRequest(http.MethodPut, "/api/state", strings.NewReader(
		`{"habits":[{"id":"walk","name":" ","emoji":"🚶","color":"#A7C7E7","createdAt":"2026-11-25"}],"completions":{}}`,
	))
	result := httptest.NewRecorder()
	handler.ServeHTTP(result, req)
	if result.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", result.Code)
	}
}

func TestStateRejectsUnsupportedMethod(t *testing.T) {
	handler := newHandler(t.TempDir() + "/state.json")
	req := httptest.NewRequest(http.MethodPost, "/api/state", nil)
	result := httptest.NewRecorder()
	handler.ServeHTTP(result, req)
	if result.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", result.Code)
	}
}

func TestServerAddress(t *testing.T) {
	tests := []struct {
		name, addr, port, want string
	}{
		{name: "explicit address", addr: "127.0.0.1:9000", port: "3000", want: "127.0.0.1:9000"},
		{name: "platform port", port: "3000", want: ":3000"},
		{name: "local default", want: "127.0.0.1:8080"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := serverAddress(test.addr, test.port); got != test.want {
				t.Fatalf("serverAddress() = %q, want %q", got, test.want)
			}
		})
	}
}
