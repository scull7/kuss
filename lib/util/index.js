/* eslint no-magic-numbers: 0 */

const R = require('ramda')


const ascend = R.curry((fn, a, b) => {
  const aa = fn(a)
  const bb = fn(b)
  return aa < bb ? -1 : aa > bb ? 1 : 0
})


const descend = R.curry((fn, a, b) => {
  const aa = fn(a)
  const bb = fn(b)
  return aa > bb ? -1 : aa < bb ? 1 : 0
})


const sortWhere = R.curry((fns, list) =>
  Array.prototype.slice.call(list, 0).sort(function(a, b) {
    let result = 0
    let i      = 0
    while (0 === result && i < fns.length) {
      result = fns[i](a, b)
      i += 1
    }
    return result
  })
)


module.exports = {
  ascend
, descend
, sortWhere
}