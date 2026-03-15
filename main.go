package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

var fileMutex sync.Mutex

const scoreFile = "scoreboard.json"

type Score struct {
	Name      string `json:"name"`
	Score     int    `json:"score"`
	Rank      int    `json:"rank"`
	TimeTaken string `json:"timeTaken"`
}

type ScoreResponse struct {
	Scores           []Score `json:"scores"`
	PlayerRank       int     `json:"playerRank"`
	TotalScores      int     `json:"totalScores"`
}

func ScoreBoardHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/scoreboard" {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		fileMutex.Lock()
		defer fileMutex.Unlock()

		data, err := os.ReadFile(scoreFile)
		if err != nil {
			json.NewEncoder(w).Encode([]Score{})
			return
		}

		w.Write(data)

	case http.MethodPost:
		fileMutex.Lock()
		defer fileMutex.Unlock()

		var newScore Score
		err := json.NewDecoder(r.Body).Decode(&newScore)
		if err != nil {
			http.Error(w, "JSON Decode Error", http.StatusBadRequest)
			return
		}

		var scores []Score

		data, err := os.ReadFile(scoreFile)
		if err == nil {
			_ = json.Unmarshal(data, &scores)
		}

		scores = append(scores, newScore)

		// Sort scores in descending order & assign ranks
		for i := range scores {
			for j := i + 1; j < len(scores); j++ {
				if scores[j].Score > scores[i].Score {
					scores[i], scores[j] = scores[j], scores[i]
				}
			}
			scores[i].Rank = i + 1
		}

		// Write back to file
		data, _ = json.MarshalIndent(scores, "", "  ")
		_ = os.WriteFile(scoreFile, data, 0644)

		totalScores := len(scores)

		response := ScoreResponse{
			Scores:      scores,
			PlayerRank: newScore.Rank,
			TotalScores: totalScores,
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	default:
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	}
}

func main() {
	http.HandleFunc("/scoreboard", ScoreBoardHandler)
	http.Handle("/", http.FileServer(http.Dir("./")))
	log.Println("Server started on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
