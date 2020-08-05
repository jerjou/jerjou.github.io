let $ = q => document.querySelector(q);
let $el = (tag, props) => {
  let el = document.createElement(tag);
  if (props)
    for (let [k, v] of Object.entries(props)) {
      el[k] = v;
    }
  return el;
};
var qs = {
  getI: (k, def) => {
    qs.parsed = new URLSearchParams(location.search);
    qs.getI = (k, def) => {
      let r = parseInt(qs.parsed.get(k), 10);
      return isNaN(r) ? def : r;
    };
    return qs.getI(k, def);
  },
  getF: (k) => {
    qs.parsed = new URLSearchParams(location.search);
    qs.getF = (k) => parseFloat(qs.parsed.get(k), 10);
    return qs.getF(k);
  }
}

