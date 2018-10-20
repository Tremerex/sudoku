export default ((u) => {
  const vu = (v) => v === u

  const equals =
    f =>
      ([a, ...ra]) =>
        ([b, ...rb]) =>
          ((vu(a) && vu(b)) || f(a, b) && equals(f)(ra)(rb))

  const simpleFilter =
    f =>
      ([a, ...ra], c) => (vu(a) || (f(a) && (c = simpleFilter(f)(ra) || []).unshift(a)), c)

  const simpleMix =
    f =>
      a =>
        ([b, ...rb], c) =>
          ((vu(b)) || ((c = simpleMix(f)(a)(rb) || []).unshift(f(a, b))), c)

  const simpleMap =
    f =>
      ([a, ...ra], c) =>
        ((vu(a)) || ((c = simpleMap(f)(ra) || []).unshift(f(a))), c)

  const curry =
    f =>
      (...args) =>
        (f.length > args.length) ? (...args2) =>
          curry(f)(...args.concat(args2)) : f(...args)

  return {
    equals,
    simpleFilter,
    simpleMix,
    simpleMap,
    curry
  }

})(undefined)
