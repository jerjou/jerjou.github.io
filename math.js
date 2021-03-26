Array.prototype.slideBy = function(windo) {
  let end = 1 + this.length - windo;
  return [...Array(end).keys()].map(i => this.slice(i, i + windo));
};
let rint = (max) => Math.floor(max * Math.random());
let numDigits = (n) => Math.log10(n) + 1 | 0;

// Generates a set of random numbers that sum to the first element of the
// returned array
let makeSum = (min, max, n=2) => {
  let range = max - min;
  let divisions = [...Array(n).keys()].map(_ => min + rint(range));
  divisions.sort((a, b) => a - b);
  console.log(divisions);
  let nums = [
    divisions[0], ...divisions.slideBy(2).map(([a, b]) => b - a)];
  let sum = divisions.pop();
  return [sum, ...nums];
};

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

function generateProblems(numProbs, min, max, mix) {
  let form = $el('form', {className: 'problem'});
  let maxlength = numDigits(max);

  for (let i = 0; i < numProbs; i++) {
    let sum = makeSum(min, max, qs.getI('setSize', 2));
    let equation;
    if (Math.random() < mix) {
      equation = $el('label', {innerHTML: `${sum.slice(1).join(' + ')} =`});
      equation.appendChild($el('input', {solution: sum[0], type:'text', maxlength: maxlength}));
    } else {
      equation = $el('label', {innerHTML: `${sum.slice(0, -1).join(' &#x2212; ')} =`});
      equation.appendChild($el('input', {solution: sum[sum.length-1], type:'text', maxlength: maxlength}));
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

  return form;
}
addEventListener('DOMContentLoaded', _ => {
  let container = $('.math');
  let numProbs = qs.getI('n', 8);
  let min = qs.getI('min', 0);
  let max = qs.getI('max', 11);
  let sum_parts = qs.getI('sum_parts', 1);
  let difference_parts = qs.getI('difference_parts', 1);
  let mix = sum_parts / (sum_parts + difference_parts);

  let style = $el('style');
  $('head').appendChild(style);
  style.sheet.insertRule(`label>input{width:${2 * numDigits(max)}rem}`);

  let form = generateProblems(numProbs, min, max, mix);
  container.appendChild(form);

  let regenerate = $el('button', {className: 'regenerate', innerText: 'Regenerate'});
  regenerate.addEventListener('click', e => {
    e.preventDefault();
    let form = generateProblems(numProbs, min, max, mix);
    container.replaceChild(form, container.childNodes[0]);
  });
  container.appendChild(regenerate);

  container.appendChild($el('div', {className:'time'}));
  form.addEventListener('focusout', timer);
  form.addEventListener('submit', timer);
});

