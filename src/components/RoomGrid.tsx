import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

interface AppRoomConfig {
    id: string,
    roomName: string
}

interface RoomGridProps {
    roomConfigs: AppRoomConfig[]
}

const RoomGridRoot = styled.div(({theme}) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    margin: '32px',
}))

const RoomGridButton = styled.div(({theme}) => ({
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    '&:hover': {
        backgroundColor: '#0056b3'
    }
}))

const RoomGrid = ({ roomConfigs }: RoomGridProps) => {
    const navigate = useNavigate()

    return (
        <RoomGridRoot>
            <h1>Rooms</h1>
            {
                roomConfigs.map((cfg) => (
                    <RoomGridButton key={cfg.id} onClick={() => navigate(`/room/${cfg.id}`)}>
                        Join {cfg.roomName}
                    </RoomGridButton>
                ))
            }
        </RoomGridRoot>
    )
}

export default RoomGrid