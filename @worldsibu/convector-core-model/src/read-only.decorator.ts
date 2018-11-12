/** @module convector-core-model */
// tslint:disable:no-invalid-this

export function ReadOnly() {
  return function (
    target: any,
    key: string
  ) {
    const getSet = {
      get() {
        return this[`_${key}`];
      },
      set(newVal) {
        let setter = target.__lookupSetter__(key);
        setter = !setter || setter === getSet.set ? (v => v) : setter;

        this[`_${key}`] = this[`_${key}`] === undefined ?
          setter.call(this, newVal) : this[`_${key}`];
      },
      enumerable: true,
      configurable: true
    };

    Object.defineProperty(target, key, getSet);
  };
}
