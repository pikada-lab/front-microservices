class Repository {
  constructor(name, root, version) {
    this.lock = true;
    this.name = name;
    this.root = root;
    this.lastId = 0;
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = async (event) => {
      this.db = event.target.result;
      await this.init();
      this.lock = false;
    };
    request.onsuccess = async (event) => {
      this.db = event.target.result;
      if (this.lock) {
        await this.countLastId();
      }
      this.lock = false;
    };
    request.onerror = function (event) {
      console.warn(event);
    };
  }
  /**
   * ```
   * this.db.createObjectStore("toDoList", { keyPath: "id" });
   * objectStore.createIndex("hours", "hours", { unique: false })
   * ```
   */
  async init() {
    // console.log("Необходимо переназначить функцию");
    this.db.createObjectStore(this.root, { keyPath: "id" });
  }
  async countLastId() {
    console.log("Необходимо переназначить функцию");
  }

  async create(data) {
    if (this.lock) {
      while (this.lock) {
        await timeout(100);
      }
      return await this.create(data);
    }
    return new Promise((res, rej) => {
      const transaction = this.db.transaction([this.root], "readwrite");
      const objectStore = transaction.objectStore(this.root);
      const request = objectStore.put(data);
      request.onsuccess = () => {
        if (request.result) {
          res(Result.success(request.result));
        } else {
          res(
            Result.failure(`Неудалось создать сущность ${JSON.stringify(data)}`)
          );
        }
      };
      request.onerror = () => {
        rej();
      };
    });
  }

  async getAll() {
    if (this.lock) {
      while (this.lock) {
        await timeout(100);
      }
      return this.getAll();
    }
    return new Promise((res, rej) => {
      const transaction = this.db.transaction([this.root], "readonly");
      const objectStore = transaction.objectStore(this.root);
      const request = objectStore.getAll();
      request.onsuccess = () => {
        if (request.result) {
          res(request.result);
        } else {
          res([]);
        }
      };
      request.onerror = () => {
        rej();
      };
    });
  }

  async getOne() {
    if (this.lock) {
      while (this.lock) {
        await timeout(100);
      }
      return this.getOne(id);
    }
    return new Promise((res, rej) => {
      const transaction = this.db.transaction([this.root], "readonly");
      const objectStore = transaction.objectStore(this.root);
      const request = objectStore.get(id);
      request.onsuccess = () => {
        if (request.result) {
          res(Result.success(request.result));
        } else {
          res(Result.failure(`Сущность ${id} не найдена`));
        }
      };
      request.onerror = () => {
        rej();
      };
    });
  }
}
