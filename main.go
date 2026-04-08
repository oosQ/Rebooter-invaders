package main

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

var fileMutex sync.Mutex
var tokenMutex sync.Mutex
var validTokens = make(map[string]tokenData)

const scoreFile = "scoreboard.json"
const secretKey = "NothingIsRealJustLikeTheGame"

type Score struct {
	Name      string `json:"name"`
	Score     int    `json:"score"`
	Rank      int    `json:"rank"`
	TimeTaken string `json:"timeTaken"`
}

type ScoreResponse struct {
	Scores      []Score `json:"scores"`
	PlayerRank  int     `json:"playerRank"`
	TotalScores int     `json:"totalScores"`
}

type tokenData struct {
	score     int
	timeTaken string
	timestamp time.Time
}

type GameEndRequest struct {
	Score     int    `json:"score"`
	TimeTaken string `json:"timeTaken"`
	GameOver  bool   `json:"gameOver"`
}

type TokenResponse struct {
	Token string `json:"token"`
}

type ScoreSubmission struct {
	Name  string `json:"name"`
	Token string `json:"token"`
}

// Generate HMAC signature for the token
func generateSignature(data string) string {
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// Generate a unique token for game completion
func generateToken(score int, timeTaken string) string {
	randomBytes := make([]byte, 16)
	rand.Read(randomBytes)
	tokenID := base64.StdEncoding.EncodeToString(randomBytes)

	data := fmt.Sprintf("%s:%d:%s", tokenID, score, timeTaken)
	signature := generateSignature(data)
	token := fmt.Sprintf("%s.%s", data, signature)

	tokenMutex.Lock()
	validTokens[tokenID] = tokenData{
		score:     score,
		timeTaken: timeTaken,
		timestamp: time.Now(),
	}
	tokenMutex.Unlock()

	// Clean up old tokens (older than 5 minutes)
	go cleanupOldTokens()

	return token
}

// Validate and consume token (one-time use)
func validateToken(token string) (int, string, bool) {
	// Parse token
	var data, signature string
	for i := len(token) - 1; i >= 0; i-- {
		if token[i] == '.' {
			data = token[:i]
			signature = token[i+1:]
			break
		}
	}

	if data == "" || signature == "" {
		return 0, "", false
	}

	// Verify signature
	expectedSignature := generateSignature(data)
	if signature != expectedSignature {
		return 0, "", false
	}

	// Parse data - split by colon, handling timeTaken which contains a colon (MM:SS)
	parts := strings.Split(data, ":")
	if len(parts) < 3 {
		return 0, "", false
	}

	tokenID := parts[0]
	score, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, "", false
	}

	// Rest is timeTaken (rejoin in case it contains colons)
	timeTaken := strings.Join(parts[2:], ":")

	// Check if token exists and consume it
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	tokenInfo, exists := validTokens[tokenID]
	if !exists {
		return 0, "", false
	}

	// Verify token data matches
	if tokenInfo.score != score || tokenInfo.timeTaken != timeTaken {
		return 0, "", false
	}

	// Check token age (not older than 5 minutes)
	if time.Since(tokenInfo.timestamp) > 5*time.Minute {
		delete(validTokens, tokenID)
		return 0, "", false
	}

	// Consume token (one-time use)
	delete(validTokens, tokenID)

	return score, timeTaken, true
}

// Clean up old tokens
func cleanupOldTokens() {
	tokenMutex.Lock()
	defer tokenMutex.Unlock()

	for tokenID, tokenInfo := range validTokens {
		if time.Since(tokenInfo.timestamp) > 5*time.Minute {
			delete(validTokens, tokenID)
		}
	}
}

// Handler for game end - generates token
func GameEndHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req GameEndRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate that game is actually over
	if !req.GameOver {
		http.Error(w, "Game not finished", http.StatusBadRequest)
		return
	}

	// Generate token
	token := generateToken(req.Score, req.TimeTaken)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(TokenResponse{Token: token})
}

func ScoreBoardHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/scoreboard" {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	// [ GET request: Return the current scoreboard ]
	case http.MethodGet:
		fileMutex.Lock()
		defer fileMutex.Unlock()

		data, err := os.ReadFile(scoreFile)
		if err != nil {
			json.NewEncoder(w).Encode([]Score{})
			return
		}

		w.Write(data)

	// [ POST request: Add a new score and return the updated scoreboard ]
	case http.MethodPost:
		fileMutex.Lock()
		defer fileMutex.Unlock()

		var submission ScoreSubmission
		err := json.NewDecoder(r.Body).Decode(&submission)
		if err != nil {
			http.Error(w, "JSON Decode Error", http.StatusBadRequest)
			return
		}

		// Validate token
		score, timeTaken, valid := validateToken(submission.Token)
		if !valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		var scores []Score

		data, err := os.ReadFile(scoreFile)
		if err == nil {
			_ = json.Unmarshal(data, &scores)
		}

		newScore := Score{
			Name:      submission.Name,
			Score:     score,
			TimeTaken: timeTaken,
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
			PlayerRank:  newScore.Rank,
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
	http.HandleFunc("/game-end", GameEndHandler)
	http.Handle("/", http.FileServer(http.Dir("./")))
	log.Println("Server started on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
