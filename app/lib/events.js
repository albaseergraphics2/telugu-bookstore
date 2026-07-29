let clients = [];

export function addClient(controller) {
  clients.push(controller);
}

export function removeClient(controller) {
  clients = clients.filter((c) => c !== controller);
}

export function notifyClients(data) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  clients = clients.filter((controller) => {
    try {
      controller.enqueue(message);
      return true;
    } catch {
      // Remove closed connection
      return false;
    }
  });
}