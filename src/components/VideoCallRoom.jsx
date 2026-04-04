import { useEffect } from 'react';
import { useDyteClient, DyteProvider } from '@dytesdk/react-web-core';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { Loader2 } from 'lucide-react';

export default function VideoCallRoom({ authToken }) {
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    if (authToken) {
      initMeeting({
        authToken,
        defaults: { audio: true, video: true },
      });
    }
  }, [authToken]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-white">
        <Loader2 size={32} className="animate-spin text-blue-400" />
        <span className="text-sm text-slate-400">Initializing video call...</span>
      </div>
    );
  }

  return (
    <DyteProvider value={meeting}>
      <DyteMeeting mode="fill" meeting={meeting} />
    </DyteProvider>
  );
}
