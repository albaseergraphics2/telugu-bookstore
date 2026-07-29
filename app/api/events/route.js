import { addClient, removeClient } from "@/app/lib/events";

export async function GET() {
  let controllerRef;

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;

      addClient(controller);

      controller.enqueue(
        `data: ${JSON.stringify({ connected: true })}\n\n`
      );
    },

    cancel() {
      removeClient(controllerRef);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}