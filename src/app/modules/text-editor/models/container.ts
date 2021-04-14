export class Container<T> {
  constructor(private _value?: T) {}

  get value(): T {
    if (!this._value) throw `Value is undefined`;
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }
}
