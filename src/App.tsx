import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import '@livekit/components-styles';
import RoomGrid from './components/RoomGrid';
import MeetingRoomPage from './screens/MeetingRoomPage';
import NavLayout from './components/NavLayout';
import { useEffect, useState } from 'react';
import NotFound from './components/NotFound';

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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
