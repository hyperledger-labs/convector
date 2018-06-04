export function ReadOnly() {
  return function (
    target: any,
    key: string
  ) {
    let val;
    const setter = target.__lookupSetter__(key) || (v => v);

    if (!setter) {
      delete target[key];
    }

    Object.defineProperty(target, key, {
      get: () => val,
      set: newVal => val === undefined ? val = setter(newVal) : val,
      enumerable: true,
      configurable: true
    });
  };
}
