var Result = (function () {
  var initializing = false;
  var Result = function (value, isFailure, error) {
    if (!initializing) {
      throw new Error(
        "Объект значения можно создать только через метод success или failure"
      );
    }
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

  Result.success = (value) => {
    initializing = true;
    return new Result(value);
  };

  Result.failure = (error) => {
    initializing = true;
    return new Result(null, true, error);
  };

  Result.all = (...results) => {
    const values = [];
    for (let result of results) {
      if (result.isFailure) {
        return result;
      }
      values.push(result.value);
    }
    return Result.success(values);
  };

  Result.prototype.map = function (clb) {
    if (this.isFailure) {
      return this;
    }
    if (!clb) return this;
    if (typeof clb !== "function") {
      console.warn("Ошибка программиста");
      return this;
    }
    const result = clb(this.value);
    if (result instanceof Result) {
      return result;
    }
    return Result.success(result);
  };

  return Result;
})();
