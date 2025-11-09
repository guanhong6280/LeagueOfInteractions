import { useEffect, useMemo, useRef, useState } from 'react';

export function useVideoEvents(videoId) {
  const [snapshot, setSnapshot] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const sourceRef = useRef(null);

  const isActive = useMemo(() => Boolean(videoId), [videoId]);

  useEffect(() => {
    if (!isActive) return;

    const url = `/api/videos/${encodeURIComponent(videoId)}/events`;
    const es = new EventSource(url);
    sourceRef.current = es;

    const onSnapshot = (e) => {
      try { setSnapshot(JSON.parse(e.data)); } catch {}
    };
    const onProcessing = (e) => {
      setLastEvent({ type: 'processing', data: safeParse(e.data) });
      setSnapshot((prev) => ({ ...(prev || {}), status: 'processing' }));
    };
    const onReady = (e) => {
      const payload = safeParse(e.data);
      setLastEvent({ type: 'ready', data: payload });
      setSnapshot((prev) => ({ ...(prev || {}), status: 'ready', playbackUrl: payload?.playbackUrl }));
    };
    const onFailed = (e) => {
      setLastEvent({ type: 'failed', data: safeParse(e.data) });
      setSnapshot((prev) => ({ ...(prev || {}), status: 'failed' }));
    };
    const onApproved = (e) => {
      setLastEvent({ type: 'approved', data: safeParse(e.data) });
      setSnapshot((prev) => ({ ...(prev || {}), isApproved: true }));
    };
    const onRejected = (e) => {
      setLastEvent({ type: 'rejected', data: safeParse(e.data) });
    };

    es.addEventListener('snapshot', onSnapshot);
    es.addEventListener('processing', onProcessing);
    es.addEventListener('ready', onReady);
    es.addEventListener('failed', onFailed);
    es.addEventListener('approved', onApproved);
    es.addEventListener('rejected', onRejected);

    es.onerror = () => {
      // Let EventSource auto-reconnect; optionally handle UI state
    };

    return () => {
      try { es.close(); } catch {}
      sourceRef.current = null;
    };
  }, [isActive, videoId]);

  return { snapshot, lastEvent };
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}


