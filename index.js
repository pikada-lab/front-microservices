const client = new WorkerClient({
  name: "Moscow",
  resource: `./moscow.js`,
});
const client2 = new WorkerClient({
  name: "Irkutsk",
  resource: `./irkutsk.js`,
});

document.getElementById("button1").addEventListener("click", async () => {
  document.getElementById("log1").innerText = "Загрузка";
  const result = await client.get("log");
  document.getElementById("log1").innerText = JSON.stringify(result);
});

document.getElementById("button2").addEventListener("click", async () => {
  document.getElementById("log2").innerText = "Загрузка";
  const result = await client.get("pi/1000");
  document.getElementById("log2").innerText = JSON.stringify(result);
});

document.getElementById("button3").addEventListener("click", async () => {
  document.getElementById("log3").innerText = "Загрузка";
  const result = await client2.get("log");
  document.getElementById("log3").innerText = JSON.stringify(result);
});

const repo = new Repository("city", "test", 1);
repo.create({ id: 1, name: "test message" }).then(console.log);
