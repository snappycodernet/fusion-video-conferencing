import { PreJoin, RoomContext, useConnectionState } from "@livekit/components-react";
import { useParams } from "react-router-dom";
import { Room, type RoomOptions } from "livekit-client";
import MeetingRoom from "../components/MeetingRoom";
import { useEffect, useState, type ReactNode } from "react";
import { AUTH_SERVER_URL, LIVE_KIT_SERVER_URL } from "../constants/appConstants";
import { useDispatch } from "react-redux";
import { clearToken, setToken } from "../redux/slices/authSlice";

const DEFAULT_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true, // Optimize video quality for each participant's screen
  dynacast: true, // Enable automatic audio/video quality optimization
}

const MeetingRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const [room] = useState(() => new Room(DEFAULT_ROOM_OPTIONS))
  const connectionState = useConnectionState(room)
  const dispatch = useDispatch();
  
  if (!roomId) return <div>Invalid room</div>;

  // You can manage room connection lifecycle here
  useEffect(() => {
    return () => {
      room.disconnect();
      dispatch(clearToken())
    };
  }, [room]);

  const fetchLiveKitToken = async (roomId: string, identity: string, isAdmin: boolean): Promise<string|null> => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room: roomId, identity, isAdmin }),
      });
  
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }
  
      const data = await response.json();

      return data.token;
    }
    catch(err) {
      return null
    }
  }

  const connect = async (roomId: string, identity: string, isAdmin: boolean) => {
    const token = await fetchLiveKitToken(roomId, identity, isAdmin)

    if(token) {
      await room.connect(LIVE_KIT_SERVER_URL, token)
      dispatch(setToken(token))
    }
  };

  let DisplayNode: ReactNode

  switch(connectionState) {
    case 'connecting': {
      DisplayNode = (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          color: '#111',
          fontSize: '42px',
          width: '100%',
          height: '100%',
        }}>
          <h1>... Loading ...</h1>
        </div>
      )
      break
    }
    case 'connected': {
      DisplayNode = <MeetingRoom />
      break
    }
    case 'disconnected':
    default:
      DisplayNode = (
        <div style={{margin: '8px'}}>
          <PreJoin 
            onSubmit={(userChoices) => {
              const identity = userChoices.username
              connect(roomId!, identity, true)
            }}
          />
        </div>
      )
      break
  }

  return (
    <RoomContext.Provider value={room}>
      <h1 style={{textAlign: 'center'}}>Room {roomId}</h1>
      <div data-lk-theme="default" style={{ height: '80vh' }}>
        {DisplayNode}
      </div>
    </RoomContext.Provider>
  )
}

export default MeetingRoomPage