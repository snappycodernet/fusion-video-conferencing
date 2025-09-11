import styled from '@emotion/styled'
import { Participant } from 'livekit-client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AUTH_SERVER_URL } from '../constants/appConstants'

const PreJoinParticipantListRoot = styled.div(({theme}) => ({
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: '8px',
    color: 'white',
    fontSize: '12px',
    background: '#333'
}))

interface PreJoinParticipantListProps {
    roomId: string
}

const PreJoinParticipantList = ({ roomId }: PreJoinParticipantListProps) => {
    const [participants, setParticipants] = useState<Participant[]>([])
    const intervalRef = useRef<NodeJS.Timeout|null>(null)

    useEffect(() => {
        const getParticipantList = async () => {
            const participantList = await fetchParticipants()
            setParticipants(participantList)
        }

        getParticipantList()

        intervalRef.current = setInterval(getParticipantList, 5000)

        return () => {
            if(intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const fetchParticipants = useCallback(async () => {
        try {
            const response = await fetch(`${AUTH_SERVER_URL}/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ room: roomId }),
            });
    
            if (!response.ok) {
                const errText = await response.text()
                throw new Error(errText);
            }
        
            const data = await response.json();
    
            return data
        }
        catch(err) {
            console.log('err', err)

            return []
        }
    }, [roomId])
    
    return (
        <PreJoinParticipantListRoot>
            <h3>{participants.length} Participant(s):</h3>
            {
                participants
                    .slice()
                    .sort((a, b) => a.identity.localeCompare(b.identity))
                    .map(p => p.identity)
                    .join(', ')
            }
        </PreJoinParticipantListRoot>
    )
}

export default PreJoinParticipantList