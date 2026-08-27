// app/hooks/useRealtime.js

import { useEffect, useRef } from "react";

export default function useRealtime(callback, deps = []) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = () => {
      callbackRef.current();
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, deps);
}