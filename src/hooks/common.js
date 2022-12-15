const delay = ms => new Promise(res => setTimeout(res, ms));
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};
module.exports = {
  delay,
  getCircularReplacer,
};
