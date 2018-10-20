export default class Functor {
  constructor (object) {
    this.object = object
  }

  map(f) {
    const mapped = {}
    for(const key of Object.keys(this.object)) {
      mapped[key] = f(key, this.object[key], this.object)
    }
    return new Functor(mapped)
  }

  filter(f) {
    const mapped = {}
    for(const key of Object.keys(this.object)) {
      if(f(key, this.object[key], this.object)) {
        mapped[key] = this.object[key]
      }
    }
    return new Functor(mapped)
  }

  containsKey(key) {
    return key in this.object
  }

  value(key) {
    return this.object[key]
  }

  toObject() {
    return this.object
  }
}