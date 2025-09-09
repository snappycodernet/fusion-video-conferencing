import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import '@livekit/components-styles';
import RoomGrid from './components/RoomGrid';
import MeetingRoomPage from './screens/MeetingRoomPage';
import NavLayout from './components/NavLayout';
import { useEffect, useState } from 'react';

const App = () => {
  const [roomsData, setRoomsData] = useState([])
  
  useEffect(() => {
    fetch('/rooms-config.json')
      .then((res) => res.json())
      .then((data) => setRoomsData(data));
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavLayout />}>
          <Route index element={<RoomGrid roomConfigs={roomsData} />} />
          <Route path="/room" element={<Navigate to="/" replace />} />
          <Route path="/room/:roomId" element={<MeetingRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

/*
export interface AppRoomConfig {
  id: number,
  roomName: string
}

const App = () => {
  const rooms: AppRoomConfig[] = roomsData

  return (
    <RoomGrid roomConfigs={rooms} />
  )
}

export default App
*/

/*
export default function App() {
  const room = new Room({
    // Optimize video quality for each participant's screen
    adaptiveStream: true,
    // Enable automatic audio/video quality optimization
    dynacast: true,
  })

  return (
    <RoomContext.Provider value={room}>
      <MyRoom />
    </RoomContext.Provider>
  );
}
*/

/*
const MyRoom = () => {
  const room = useRoomContext()
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      room.disconnect(true);
    };
  }, []);

  const { buttonProps } = useDisconnectButton({
    onClick: () => {
      room.disconnect(true)
      setConnected(false)
    },
  })

  const fetchLiveKitToken = async (room: string, identity: string): Promise<string|null> => {
    try {
      const response = await fetch(`${authServerUrl}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ room, identity }),
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

  const connect = async (identity: string) => {
    setLoading(true)
    const token = await fetchLiveKitToken(roomName, identity)

    if(token) {
      await room.connect(serverUrl, token);
      setConnected(true)
    }

    setLoading(false)
  };

  return (
    <div data-lk-theme="default" style={{ height: '80vh' }}>
      {
        loading ? (
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
        ) : !connected ? (
          <div style={{margin: '8px'}}>
            <PreJoin 
              onSubmit={(userChoices) => {
                const identity = userChoices.username
                connect(identity)
              }}
            />
          </div>
        ) : (
          <>
            <div style={{margin: '8px'}}>
              <button {...buttonProps}>Leave</button>
            </div>
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar controls={{ leave: false }} />
          </>
        )
      }
    </div>
  );
}
*/

/*
const MyVideoConference = () => {
  // `useTracks` returns all camera and screen share tracks. If a user
  // joins without a published camera track, a placeholder track is returned.
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <GridLayout tracks={tracks} style={{ height: 'calc(100vh - var(--lk-control-bar-height))' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
*/