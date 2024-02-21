var Response = (function () {
  var initializing = false;
  var Response = function (id, value, isFailure, error, code) {
    if (!initializing) {
      throw new Error(
        "Объект значения можно создать только через метод success или failure"
      );
    }
    this.id = id;
    this.code = code ?? 200;
    initializing = false;
    if (!isFailure) {
      this.value = value;
      this.error = "";
      this.isFailure = false;
    } else {
      this.value = null;
      this.isFailure = true;
      this.error = error;
    }
  };

  Response.success = (id, value) => {
    initializing = true;
    return new Response(id, value);
  };

  Response.failure = (id, code, error) => {
    initializing = true;
    return new Response(id, null, true, error, code);
  };
  return Response;
})();
