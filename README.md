# Пример инфраструктурных объектов браузера

Предполагается, что можно сделать обёртку для воркера так, что он будет работать как сервер.

| п.п. | файл             | вызов                                                         | назначение                                                      |
| :--: | :--------------- | :------------------------------------------------------------ | :-------------------------------------------------------------- |
|  1.  | timeout.js       | timeout(time)                                                 | Обёртка над таймаутом, возвращает Promise                       |
|  2.  | result.js        | Result.success(value) / Result.failure(err)                   | Монада Either                                                   |
|  3.  | response.js      | Response.success(id, value) / Result.failure(id, err)         | Обёртка для ответа "Сервера" - "Клиенту"                        |
|  4.  | resource-path.js | new ResoursePath('/log/:id')                                  | Абстрация пути, позволяет сравнивать пути и извлекать параметры |
|  5.  | repository.js    | new Repository('example', 'test', 1)                          | Абстрация над репозиторием, создаёт базу IndexedDB              |
|  6.  | worker-client.js | new WorkerClient({name: `Irkutsk`, resource: `./irkutsk.js`}) | Клиент для запросов к "Серверу"                                 |
|  7.  | worker-server.js | new WorkerServer();                                           | "Сервер" для SharedWorker                                       |

## Установка

```bash
npm install
```

## Запуск

```bash
npm start
```

## Использование

Window
```js
const client = new WorkerClient({
  name: "Moscow",
  resource: `./moscow.js`,
});
client.get("log/3")
client.post("log", {...data})
client.put("log/1", {...data})
client.delete("log/2")
client.stream("log")
```

SharedWorker moscow.js
```js
const server = new WorkerServer();
server.get("log", async () => {
  await timeout(1000); // Нагрузка
  return [1, 2, 3, 4, 5]; // Результат в виде DTO без поведения
});
```