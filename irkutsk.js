self.importScripts("../common/result.js");
self.importScripts("../common/response.js");
self.importScripts("../common/resourse-path.js");
self.importScripts("../common/worker-server.js");
self.importScripts("../common/timeout.js");
self.importScripts("../common/worker-client.js");

const server = new WorkerServer();
const client = new WorkerClient({
  name: "Moscow",
});

server.get("log", async () => {
  await timeout(1000);
  const log = await client.get("log");
  await timeout(1000);
  return [...log, 6, 7, 8, 9, 10];
});
