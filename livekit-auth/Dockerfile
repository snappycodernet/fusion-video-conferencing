FROM golang:1.25 AS builder
WORKDIR /app
COPY . .
RUN go build -o livekit-auth-server .

FROM gcr.io/distroless/base-debian12
COPY --from=builder /app/livekit-auth-server /livekit-auth-server
CMD ["/livekit-auth-server"]
