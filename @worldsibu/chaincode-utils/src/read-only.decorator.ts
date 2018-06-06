// tslint:disable:no-invalid-this

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
        return this[`_${key}`];
      },
      set(newVal) {
        this[`_${key}`] = this[`_${key}`] === undefined ?
          setter.call(this, newVal) : this[`_${key}`];
      },
      enumerable: true,
      configurable: true
    });
  };
}
