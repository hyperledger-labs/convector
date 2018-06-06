export function ReadOnly() {
  return function (
    target: any,
    key: string
  ) {
    const setter = target.__lookupSetter__(key) || (v => v);

    if (!setter) {
      delete target[key];
    }

    Object.defineProperty(target, key, {
      get() {
        // tslint:disable-next-line:no-invalid-this
        return this[`_${key}`];
      },
      set(newVal) {
        // tslint:disable-next-line:no-invalid-this
        this[`_${key}`] = this[`_${key}`] === undefined ? setter(newVal) : this[`_${key}`];
      },
      enumerable: true,
      configurable: true
    });
  };
}
