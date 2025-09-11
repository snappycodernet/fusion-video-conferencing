import { useEffect, useState } from "react";
import { useRemoteParticipants, useRoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import { AUTH_SERVER_URL } from "../constants/appConstants";
import { useSelector } from "react-redux";
import { type RootState } from "../redux/store";
import styled from "@emotion/styled";
import { RemoteParticipant, RoomEvent } from "livekit-client";

const AdminPanelRoot = styled.div(({}) => ({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: '250px',
    gap: '8px',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: '8px',
    border: '1px solid white',
    backgroundColor: '#111',
    alignSelf: 'center',
    justifySelf: 'center',
    borderRadius: '8px',
}))

const AdminPanelRemoveButton = styled.button(({}) => ({
    outline: 'none',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: 'crimson',
    fontSize: '14px',
    padding: '8px',
    ':hover': {
        backgroundColor: 'rgba(164, 22, 52, 1)',
        cursor: 'pointer',
    },
    ':disabled': {
        backgroundColor: '#ddd',
        color: '#111'
    }
}))

const AdminPanel = () => {
    const room = useRoomContext()
    const participants = useRemoteParticipants()
    const token = useSelector((state: RootState) => state.auth.token)
    const [removing, setRemoving] = useState<string | null>(null)

    useEffect(() => {
        if(removing) {
            try {
                room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
                    if(participant.identity === removing) {
                        setRemoving(null)
                    }
                })
            }
            catch(err) {
                setRemoving(null)
            }
        }

        () => {
            room.off(RoomEvent.ParticipantDisconnected, () => setRemoving(null))
        }
    }, [room, removing])
    
    const removeParticipant = async (identity: string) => {
        setRemoving(identity);

        try {
            await fetch(`${AUTH_SERVER_URL}/admin/remove-participant`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ room: room.name, identity }),
            });
        }
        catch(err) {
            setRemoving(null)
        }
    }

    return (
        <AdminPanelRoot>
            {participants.map((p) => (
                <AdminPanelRemoveButton
                    key={p.identity}
                    disabled={removing === p.identity}
                    onClick={() => removeParticipant(p.identity)}
                >
                    { 
                        removing === p.identity ? `Removing... ${p.identity}` : `Remove ${p.identity}`
                    }
                </AdminPanelRemoveButton>
            ))}
        </AdminPanelRoot>
    );
}

export default AdminPanel