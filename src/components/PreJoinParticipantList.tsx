import styled from '@emotion/styled'
import { Participant } from 'livekit-client'
import { useEffect, useState } from 'react'
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

let interval: number

interface PreJoinParticipantListProps {
    roomId: string
}

const PreJoinParticipantList = ({ roomId }: PreJoinParticipantListProps) => {
    const [participants, setParticipants] = useState<Participant[]>([])

    useEffect(() => {
        const getParticipantList = async () => {
            const participantList = await fetchParticipants()
            setParticipants(participantList)
        }

        getParticipantList()

        interval = setInterval(getParticipantList, 3000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    console.log('room participants', participants)

    const fetchParticipants = async () => {
        try {
            const response = await fetch(`${AUTH_SERVER_URL}/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ room: roomId }),
            });

            console.log('fetchParticipantsResponse', response)
    
            if (!response.ok) {
                const errText = await response.text()
                throw new Error(errText);
            }
        
            const data = await response.json();
    
            return data || []
        }
        catch(err) {
            console.log('err', err)

            return []
        }
    }
    
    return (
        <PreJoinParticipantListRoot>
            <h3>{participants.length} Participant(s):</h3>
            {
                participants.sort().map(p => p.identity).join(', ')
            }
        </PreJoinParticipantListRoot>
    )
}

export default PreJoinParticipantList