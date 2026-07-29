import { useEffect, useRef } from "react";

export default function useRealtime(callback, deps = []) {
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();

    const eventSource = new EventSource("/api/events");

    eventSource.onmessage = () => {
      callbackRef.current();
    };

    return () => {
      eventSource.close();
    };
  }, deps);
}