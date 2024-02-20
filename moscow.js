self.importScripts("../common/result.js");
self.importScripts("../common/response.js");
self.importScripts("../common/resourse-path.js");
self.importScripts("../common/worker-server.js");
self.importScripts("../common/timeout.js");

const server = new WorkerServer();
server.get("log", async () => {
  await timeout(1000);
  return [1, 2, 3, 4, 5];
});

server.get("pi/:id", async (data, props) => {
  let iter = generateDigitsOfPi();
  let digits = "";
  for (let i = 0; i < +props.get("id"); i++) digits += iter.next().value;
  return (
    digits.substring(0, 1) +
    "." +
    digits
      .substring(1)
      .split(/(\d{3})/)
      .join(" ")
  );
});

// PI генератор
function* generateDigitsOfPi() {
  let q = 1n;
  let r = 180n;
  let t = 60n;
  let i = 2n;
  while (true) {
    let digit = ((i * 27n - 12n) * q + r * 5n) / (t * 5n);
    yield Number(digit);
    let u = i * 3n;
    u = (u + 1n) * 3n * (u + 2n);
    r = u * 10n * (q * (i * 5n - 2n) + r - t * digit);
    q *= 10n * i * (i++ * 2n - 1n);
    t *= u;
  }
}
