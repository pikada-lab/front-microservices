class WorkerClient {
  constructor(config) {
    if (!config) {
      throw new Error(
        "Конструктор принимает 1 параметр, объект с именем и адрес ресурса"
      );
    }
    if (!("name" in config)) {
      throw new Error("Клиент должен содержать имя воркера");
    }
    if (!("resource" in config) && typeof window === "object") {
      throw new Error("Клиент должен содержать адрес воркера");
    }
    this.name = config.name;
    this.timeout = config.timeout ?? 30000;
    this.resource = config.resource;
    this.tasks = [];
    this.lock = true;
    this.contextId = this.getNextId();
    this.serverChannel = new BroadcastChannel(this.name);
    this.clientChannel = new BroadcastChannel(this.contextId);
    this.lazer = new Map();
    this.clientChannel.addEventListener("message", (e) => {
      const { id } = e.data;
      if (id) {
        this.execute(e);
      }
    });
    if (typeof window === "object") {
      this.worker = new SharedWorker(this.resource, {
        name: this.name,
        credentials: "include",
        type: "classic",
      });
      this.worker.port.addEventListener("message", (connectMessage) => {
        console.log(connectMessage.data);
        if (connectMessage.data === "PENDING_MESSAGE") {
          this.lock = false;
          this.onconnect();
        }
      });
      this.worker.port.start();
    } else {
      this.lock = false;
      this.onconnect();
    }
  }

  /**
   * Происходит когда воркер прислал сообщение PENDING_MESSAGE и готов к работе
   */
  onconnect = () => {};

  /**
   * @private
   */
  execute(event) {
    const { id, isFailure, value, error, done } = event.data;
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      return console.warn("Таймаут");
    }
    if (this.tasks[index].isStream) {
      if (!Array.isArray(lazer.get(task.id))) {
        this.lazer.set(task.id, []);
      }
      if (done) {
        const task = this.tasks.splice(index, 1)[0];
        const data = lazer.get(task.id);
        this.lazer.delete(task.id);
        task.resolve({ isFailure: false, value: data, error: "" });
      } else {
        const task = this.tasks[index];
        this.lazer.get(task.id).push(...value);
      }
      return;
    }
    const task = this.tasks.splice(index, 1)[0];
    if (isFailure) {
      task.reject(error);
    } else {
      task.resolve(value);
    }
  }

  /**
   * @private
   */
  getNextId() {
    return Math.round(Math.random() * 0xffffffff).toString(16);
  }

  /**
   * @private
   */
  timeoutHandler(id) {
    setTimeout(() => {
      const index = this.tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        const task = this.tasks.splice(index, 1)[0];
        task.reject();
      }
    }, this.timeout);
  }

  addTask(id, resolve, reject, isStream = false) {
    this.tasks.push({
      id,
      isStream: isStream,
      timeout: this.timeout,
      resolve,
      reject,
    });
  }

  /**
   * @private
   */
  sendMessage(id, method, path, data = null) {
    this.serverChannel.postMessage({
      id,
      contextId: this.contextId,
      method,
      path,
      data,
    });
  }

  /**
   * Выполняет удалённую процедуру RemoteProcedur на воркер и возвращает данные
   * @param {string} path Путь к ресурсу
   * @param {T} data Данные
   * @returns unknow
   */
  async post(path, data) {
    if (this.lock) {
      await timeout(100);
      return this.post(path, data);
    }
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.timeoutHandler(id);
      this.addTask(id, resolve, reject);
      this.sendMessage(id, "POST", path, data);
    });
  }

  /**
   * Выполняет запрос на воркер и возвращает данные
   * @param {string} path Путь к ресурсу
   * @param {T} data Данные
   * @returns unknow
   */
  async get(path) {
    if (this.lock) {
      await timeout(100);
      return this.get(path);
    }
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.timeoutHandler(id);
      this.addTask(id, resolve, reject);
      this.sendMessage(id, "GET", path);
    });
  }

  /**
   * Выполняет запрос на изменение данных на воркер и возвращает данные
   * @param {string} path Путь к ресурсу
   * @param {T} data Данные
   * @returns unknow
   */
  async put(path, data) {
    if (this.lock) {
      await timeout(100);
      return this.put(path, data);
    }
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.timeoutHandler(id);
      this.addTask(id, resolve, reject);
      this.sendMessage(id, "PUT", path, data);
    });
  }

  /**
   * Выполняет запрос на удаление данных на воркер
   * @param {string} path Путь к ресурсу
   * @param {T} data Данные
   * @returns unknow
   */
  async delete(path) {
    if (this.lock) {
      await timeout(100);
      return this.delete(path);
    }
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.timeoutHandler(id);
      this.addTask(id, resolve, reject);
      this.sendMessage(id, "DELETE", path);
    });
  }

  /**
   * Выполняет запрос к массиву большой длинны
   * @param {string} path Путь к ресурсу
   * @param {T} data
   * @returns Promise<any[]>
   */
  async stream(path, data) {
    if (this.lock) {
      await timeout(100);
      return this.stream(path, data);
    }
    return new Promise((resolve, reject) => {
      const id = this.getNextId();
      this.timeoutHandler(id);
      this.addTask(id, resolve, reject, true);
      this.sendMessage(id, "STREAM", path, data);
    });
  }
}
