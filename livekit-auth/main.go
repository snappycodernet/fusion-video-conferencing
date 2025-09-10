package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
)

var LIVEKIT_API_KEY = os.Getenv("LIVEKIT_API_KEY")
var LIVEKIT_API_SECRET = os.Getenv("LIVEKIT_API_SECRET")
var LIVEKIT_HOST_URL = os.Getenv("LIVEKIT_HOST_URL")

func identityInUse(identity string, room string) bool {
	roomClient := lksdk.NewRoomServiceClient(LIVEKIT_HOST_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)

	resp, _ := roomClient.ListParticipants(context.Background(), &livekit.ListParticipantsRequest{
		Room: room,
	})

	for _, participant := range resp.Participants {
		if participant.Identity == identity {
			return true
		}
	}

	return false
}

func getJoinToken(apiKey string, apiSecret string, room string, identity string, isAdmin bool) (string, error) {
	canPublish := true
	canSubscribe := true

	at := auth.NewAccessToken(apiKey, apiSecret)
	grant := &auth.VideoGrant{
		RoomJoin:       true,
		Room:           room,
		RoomAdmin:      isAdmin,
		CanPublish:     &canPublish,
		CanSubscribe:   &canSubscribe,
		CanPublishData: &canPublish,
	}

	at.SetVideoGrant(grant).
		SetIdentity(identity).
		SetValidFor(time.Hour)

	return at.ToJWT()
}

func removeParticipantHandler(w http.ResponseWriter, r *http.Request) {
	// Decode the request body
	type request struct {
		Room     string `json:"room"`
		Identity string `json:"identity"`
	}

	var req request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Extract token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		http.Error(w, "Missing or invalid Authorization header", http.StatusUnauthorized)
		return
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")

	// Parse and verify the token
	verifier, err := auth.ParseAPIToken(token)

	claims, err := verifier.Verify(LIVEKIT_API_SECRET)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	grant := claims.Video

	if grant == nil || !grant.RoomAdmin {
		http.Error(w, "Insufficient permissions", http.StatusForbidden)
		return
	}

	// Use RoomServiceClient to remove participant
	roomClient := lksdk.NewRoomServiceClient(LIVEKIT_HOST_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
	_, err = roomClient.RemoveParticipant(r.Context(), &livekit.RoomParticipantIdentity{
		Room:     req.Room,
		Identity: req.Identity,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to remove participant: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Participant removed successfully"))
}

func getParticipantsHandler(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Room string `json:"room"`
	}
	var req request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	roomClient := lksdk.NewRoomServiceClient(LIVEKIT_HOST_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
	resp, err := roomClient.ListParticipants(context.Background(), &livekit.ListParticipantsRequest{
		Room: req.Room,
	})

	if err != nil {
		http.Error(w, "failed to fetch participant list", http.StatusInternalServerError)
		return
	}

	payload, err := json.Marshal(resp.Participants)

	if err != nil {
		http.Error(w, "failed to marshal participant list", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(payload)
}

func tokenHandler(w http.ResponseWriter, r *http.Request) {
	type request struct {
		Room     string `json:"room"`
		Identity string `json:"identity"`
		IsAdmin  bool   `json:"isAdmin"`
	}
	var req request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	inUse := identityInUse(req.Identity, req.Room)

	if inUse {
		http.Error(w, "Username has been taken.", http.StatusConflict)
		return
	}

	token, err := getJoinToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, req.Room, req.Identity, req.IsAdmin)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func withCORS(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		h(w, r)
	}
}

func main() {
	http.HandleFunc("/token", withCORS(tokenHandler))
	http.HandleFunc("/admin/remove-participant", withCORS(removeParticipantHandler))
	http.HandleFunc("/participants", withCORS(getParticipantsHandler))
	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
