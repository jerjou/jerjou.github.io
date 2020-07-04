let $ = q => document.querySelector(q);
let $el = (tag, props) => {
  let el = document.createElement(tag);
  if (props)
    for (let [k, v] of Object.entries(props)) {
      el[k] = v;
    }
  return el;
};
let rint = (max) => Math.floor(max * Math.random());
let numDigits = (n) => Math.log10(n) + 1 | 0;
let makeSum = (min, max) => {
  let range = max - min;
  let sum = min + 1 + rint(range - 1);
  let first = rint(sum);
  let second = sum - first;
  return [first, second, sum];
};
var qs = {
  getI: (k) => {
    qs.parsed = new URLSearchParams(location.search);
    qs.getI = (k) => parseInt(qs.parsed.get(k), 10);
    return qs.getI(k);
  },
  getF: (k) => {
    qs.parsed = new URLSearchParams(location.search);
    qs.getF = (k) => parseFloat(qs.parsed.get(k), 10);
    return qs.getF(k);
  }
}
addEventListener('DOMContentLoaded', () => {
  let container = $('.math');
  let numProbs = qs.getI('n') || 8;
  let min = qs.getI('min') || 0;
  let max = qs.getI('max') || 10;
  let style = $el('style');
  $('head').appendChild(style);
  style.sheet.insertRule(`label>input{width:${2 * numDigits(max)}rem}`);
  let form = $el('form', {className: 'problem'});
  let checkInput = (input) => {
    let label = input.closest('label');
    if (!input.value.length) {
      label.classList.remove('right');
      label.classList.remove('wrong');
      return;
    }
    if (parseInt(input.value, 10) === input.solution) {
      if (!label.classList.replace('wrong', 'right')) {
        label.classList.add('right');
      }
    } else {
      if (!label.classList.replace('right', 'wrong')) {
        label.classList.add('wrong');
      }
      setTimeout(() => input.select(), 10);
    }
  };
  let checkAnswers = (e) => {
    e.preventDefault();
    if (e.target.tagName === 'INPUT') {
      checkInput(e.target);
    } else {
      [...form.querySelectorAll('input[type=text]')].forEach(checkInput);
    }
  };

  let mix = qs.getF('mix') || .5;
  for (let i = 0; i < numProbs; i++) {
    let sum = makeSum(min, max);
    let equation;
    if (Math.random() < mix) {
      equation = $el('label', {innerHTML: `${sum[0]} + ${sum[1]} =`});
      equation.appendChild($el('input', {solution: sum[2], type:'text'}));
    } else {
      equation = $el('label', {innerHTML: `${sum[2]} &#x2212; ${sum[1]} =`});
      equation.appendChild($el('input', {solution: sum[0], type:'text'}));
    }
    // Icons for right and wrong
    equation.appendChild($el('i', {className: 'cil-check right'}));
    equation.appendChild($el('i', {className: 'cil-x wrong'}));

    form.appendChild(equation);
  }
  [...form.querySelectorAll('input[type=text]')].forEach(input => {
    input.addEventListener('blur', checkAnswers);
    input.addEventListener('focus', () => input.closest('label').classList.add('active'));
    input.addEventListener('blur', () => input.closest('label').classList.remove('active'));
  });

  container.appendChild(form);
  form.querySelector('input').focus();
  form.appendChild($el('input', {type: 'submit'}));
  form.addEventListener('submit', checkAnswers);
});

