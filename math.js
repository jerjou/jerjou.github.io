Array.prototype.slideBy = function(windo) {
  let end = 1 + this.length - windo;
  return [...Array(end).keys()].map(i => this.slice(i, i + windo));
};
let rint = max => Math.floor(max * Math.random());
let numDigits = n => Math.log10(n) + 1 | 0;

// Generates a set of random numbers that sum to the first element of the
// returned array
let makeSum = (min, max, n=2) => {
  let range = max - min;
  let divisions = [...Array(n).keys()].map(_ => min + rint(range));
  // The `divisions` array holds all the numbers you'll hit along the way to
  // your sum, including the sum.
  divisions.sort((a, b) => a - b);
  // Create an array of the numbers you're going to be summing
  let nums = [
    divisions[0], ...divisions.slideBy(2).map(([a, b]) => b - a)];
  // The last number of `divisions` is the sum
  let sum = divisions.pop();
  return [sum, ...nums];
};

// min and max affect the numbers, not the final product.
let makeProduct = (min, max, n=2) => {
  let range = max - min;
  let nums = [...Array(n).keys()].map(_ => min + rint(range));
  return [nums.reduce((prev, x) => prev * x), ...nums];
};

function resetTimer() {
  var display = $('div.time');
  if (display) display.innerHTML = '';
}
function timer(e) {
  let form = $('form');
  if (!form.startTime) {
    form.startTime = Date.now();
  } else {
    let problems = [...$('form').querySelectorAll('label')];
    if (problems.every(l => l.classList.contains('right'))) {
      $('div.time').innerHTML = `
        Time elapsed: ${Math.round((Date.now() - form.startTime) / 1000)}s`;
    }
  }
}

function checkInput(input) {
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
    let nextProblem = label.nextSibling;
    if (!nextProblem || nextProblem.classList.contains('right') || !nextProblem.matches('label')) {
      nextProblem = label.parentNode.querySelector('label:not(.right)');
    }
    if (nextProblem) {
      setTimeout(_ => nextProblem.querySelector('input').select(), 10);
    }
  } else {
    if (!label.classList.replace('right', 'wrong')) {
      label.classList.add('wrong');
    }
    setTimeout(() => input.select(), 10);
  }
}

function checkAnswers(e) {
  e.preventDefault();
  if (e.target.tagName === 'INPUT') {
    checkInput(e.target);
  } else {
    [...$('form').querySelectorAll('input[type=text]')].forEach(checkInput);
  }
}

function generateProblems(numProbs, min, max, [sum_range, sub_range, mult_range, div_range]) {
  let form = $el('form', {className: 'problem'});
  let maxlength = numDigits(max);

  for (let i = 0; i < numProbs; i++) {
    let problem_type = Math.random();
    let equation;
    if (problem_type < sub_range[1]) {
      // Addition or subtraction
      let sum = makeSum(min, max, qs.getI('setSize', 2));
      if (problem_type < sum_range[1]) {
        equation = $el('label', {innerHTML: `${sum.slice(1).join(' + ')} =`});
        equation.appendChild($el('input', {solution: sum[0], type:'text', maxlength: maxlength}));
      } else {
        equation = $el('label', {innerHTML: `${sum.slice(0, -1).join(' &#x2212; ')} =`});
        equation.appendChild($el('input', {solution: sum[sum.length-1], type:'text', maxlength: maxlength}));
      }
    } else {
      // Multiplcation or division
      let prod = makeProduct(min, max, qs.getI('setSize', 2));
      if (problem_type < mult_range[1]) {
        equation = $el('label', {innerHTML: `${prod.slice(1).join(' × ')} =`});
        equation.appendChild($el('input', {solution: prod[0], type:'text', maxlength: maxlength}));
      } else {
        equation = $el('label', {innerHTML: `${prod.slice(0, -1).join(' &#x00f7; ')} =`});
        equation.appendChild($el('input', {solution: prod[prod.length-1], type:'text', maxlength: maxlength}));
      }
    }

    // Icons for right and wrong
    equation.appendChild($el('i', {className: 'cil-check right'}));
    equation.appendChild($el('i', {className: 'cil-x wrong'}));

    form.appendChild(equation);
  }
  // TODO: use a delegated event handler
  [...form.querySelectorAll('input[type=text]')].forEach(input => {
    input.addEventListener('blur', checkAnswers);
    input.addEventListener('focus', () => input.closest('label').classList.add('active'));
    input.addEventListener('blur', () => input.closest('label').classList.remove('active'));
  });

  form.appendChild($el('input', {type: 'submit'}));
  form.addEventListener('submit', checkAnswers);

  setTimeout(_ => form.querySelector('input').focus(), 10);

  // hook in the timing functionality
  form.addEventListener('focusout', timer);
  form.addEventListener('submit', timer);
  resetTimer();

  return form;
}
addEventListener('DOMContentLoaded', _ => {
  let container = $('.math');
  let numProbs = qs.getI('n', 8);
  let min = qs.getI('min', 0);
  let max = qs.getI('max', 11);

  let sum_parts = qs.getI('sums', 1);
  let difference_parts = qs.getI('subs', 1);
  let multiplication_parts = qs.getI('mults', 1);
  let division_parts = qs.getI('divs', 1);

  let total = sum_parts + difference_parts + multiplication_parts + division_parts;
  let sum_range = [0, sum_parts / total];
  let difference_range = [sum_range[1], (difference_parts + sum_parts) / total];
  let multiplication_range = [difference_range[1],
    (multiplication_parts + difference_parts + sum_parts) / total];
  let division_range = [multiplication_range[1], 1];

  let style = $el('style');
  $('head').appendChild(style);
  style.sheet.insertRule(`label>input{width:${2 * numDigits(max)}rem}`);

  container.appendChild(generateProblems(numProbs, min, max,
    [sum_range, difference_range, multiplication_range, division_range]));

  let regenerate = $el('button', {className: 'regenerate', innerText: 'Regenerate'});
  regenerate.addEventListener('click', e => {
    e.preventDefault();
    container.replaceChild(
      generateProblems(numProbs, min, max, mix),
      container.childNodes[0]);
  });
  container.appendChild(regenerate);

  container.appendChild($el('input', {type:'checkbox'}));
  container.appendChild($el('div', {className:'time'}));
});

