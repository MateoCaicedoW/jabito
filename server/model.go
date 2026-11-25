package main

import (
	"errors"
	"regexp"
	"strings"
	"time"
)

type Habit struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Emoji     string `json:"emoji"`
	Color     string `json:"color"`
	CreatedAt string `json:"createdAt"`
}

type State struct {
	Habits      []Habit            `json:"habits"`
	Completions map[string][]string `json:"completions"`
}

var (
	idPattern    = regexp.MustCompile(`^[a-zA-Z0-9_-]{1,80}$`)
	colorPattern = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)
)

func validate(state State) error {
	if len(state.Habits) > 500 {
		return errors.New("Too many habits")
	}
	ids := make(map[string]bool, len(state.Habits))
	for _, habit := range state.Habits {
		if !idPattern.MatchString(habit.ID) || ids[habit.ID] {
			return errors.New("Invalid or duplicate habit id")
		}
		ids[habit.ID] = true
		if name := strings.TrimSpace(habit.Name); name == "" || len([]rune(name)) > 80 {
			return errors.New("Habit name must be 1–80 characters")
		}
		if len([]rune(habit.Emoji)) > 8 || !colorPattern.MatchString(habit.Color) {
			return errors.New("Invalid habit appearance")
		}
		if _, err := time.Parse("2006-01-02", habit.CreatedAt); err != nil {
			return errors.New("Invalid habit creation date")
		}
	}
	for id, dates := range state.Completions {
		if !ids[id] || len(dates) > 10000 {
			return errors.New("Completion references unknown habit")
		}
		seen := make(map[string]bool, len(dates))
		for _, date := range dates {
			if _, err := time.Parse("2006-01-02", date); err != nil || seen[date] {
				return errors.New("Invalid or duplicate completion date")
			}
			seen[date] = true
		}
	}
	return nil
}
