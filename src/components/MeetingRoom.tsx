import { ControlBar, RoomAudioRenderer, useDisconnectButton, useRoomContext } from "@livekit/components-react";
import ConferenceLayout from "./ConferenceLayout";
import AdminPanel from "./AdminPanel";

const MeetingRoom = () => {
  const room = useRoomContext()

  const { buttonProps } = useDisconnectButton({
    onClick: () => {
      room.disconnect(true)
    },
  })

  return (
    <>
        <div style={{margin: '8px'}}>
            <button {...buttonProps}>Leave</button>
        </div>
        <ConferenceLayout />
        <RoomAudioRenderer />
        <ControlBar controls={{ leave: false }} />
        <AdminPanel />
    </>
  );
}

export default MeetingRoom