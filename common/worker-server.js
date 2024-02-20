class WorkerServer {
  constructor(options = {}) {
    this.timeout = options.timeout ?? 30000;
    this.debug = options.debug ?? true;
    this.endpoints = new Map();
    this.acceptMethod = ["GET", "POST", "DELETE", "PUT", "STREAM"];
    this.acceptMethod.forEach((m) => {
      this.endpoints.set(m, []);
    });
    this.channel = new BroadcastChannel(self.name);
    this.channel.addEventListener("message", async (event) => {
      const responseChannel = new BroadcastChannel(event.data.contextId);
      const result = await this.execute(event);
      responseChannel.postMessage(result);
      responseChannel.close();
    });
    globalThis.onconnect = (e) => {
      e.ports[0].start();
      e.ports[0].postMessage("PENDING_MESSAGE");
    };
  }

  /**
   * @private
   */
  async execute(event) {
    const { method, id, path, data } = event.data;
    if (this.debug) {
      console.log(Date.now(), `[${method}] ${path}`, id, data);
    }
    if (!path) {
      console.warn("NOT GOOD", event.data);

      return Response.failure(id, "Нарушение протокола");
    }
    const epResult = this.findEndpoint(method, path).map(([res, ep]) => {
      return [res.getProps(new ResoursePath(path)), ep];
    });
    if (epResult.isFailure) {
      return Response.failure(id, epResult.error);
    }
    try {
      const midleware = epResult.value[1];
      const result = await midleware(data, epResult.value[0]);
      if (method === "STREAM") {
        this.sendArray(responseChannel, id, result);
      } else {
        return Response.success(id, result);
      }
    } catch (ex) {
      return Response.failure(id, "Ошибка обработки");
    }
  }

  /**
   * @private
   */
  sendArray(port, id, items) {
    console.time("sendArray");
    while (items.length) {
      const buffer = items.splice(0, 50000);
      port.postMessage({
        id,
        value: buffer,
        done: false,
      });
    }
    port.postMessage({ id, value: null, done: true });
    console.timeEnd("sendArray");
  }

  /**
   * @private
   */
  findEndpoint(method, path) {
    const resourse = new ResoursePath(path);
    for (const ep of this.endpoints.get(method)) {
      if (ep[0].match(resourse)) {
        return Result.success(ep);
      }
    }
    return Result.failure("Ресурс не найден");
  }

  /**
   * @private
   */
  request(method, path, clb) {
    if (!this.acceptMethod.includes(method)) {
      throw new Error("Данныый метод не поддерживается");
    }
    this.endpoints.get(method).push([new ResoursePath(path), clb]);
  }

  get(path, clb) {
    this.request("GET", path, clb);
  }

  post(path, clb) {
    this.request("POST", path, clb);
  }

  del(path, clb) {
    this.delete(path, clb);
  }

  delete(path, clb) {
    this.request("DELETE", path, clb);
  }

  put(path, clb) {
    this.request("PUT", path, clb);
  }

  stream(path, clb) {
    this.request("STREAM", path, clb);
  }
}
