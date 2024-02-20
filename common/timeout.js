async function timeout(n = 250) {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, n);
  });
}
