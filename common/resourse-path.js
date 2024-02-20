class ResoursePath {
  /**
   *
   * @param {string} path
   */
  constructor(path) {
    this.parts = this.parse(path);
  }
  parse(path) {
    const value = path.startsWith("/") ? path.substring(1) : path;
    return value.split("/");
  }

  match(resourse) {
    if (resourse.parts.length !== this.parts.length) {
      return false;
    }
    for (let i in this.parts) {
      if (this.parts[i].startsWith(":")) continue;
      if (this.parts[i] !== resourse.parts[i]) return false;
    }
    return true;
  }

  getProps(resourse) {
    const props = new Map();
    for (let i in this.parts) {
      if (this.parts[i].startsWith(":")) {
        props.set(this.parts[i].substring(1), resourse.parts[i]);
      }
    }
    return props;
  }
};
