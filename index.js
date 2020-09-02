// Use scroll wheel to change numbers
window.addEventListener('wheel', e => {
  let el = e.target;
  if (!el.matches('input[type=number]')) return;
  if (el.step === 'any') return;
  let numIters = ~~Math.abs(Math.round(e.deltaY));
  if (e.deltaY < 0) {
    for (let i = 0; i< numIters; i++) el.stepUp();
  } else {
    for (let i = 0; i< numIters; i++) el.stepDown();
  }
  e.preventDefault();
});

// Link to pages that have parameters
window.addEventListener('click', e => {
  if (e.target.tagName !== 'A') return;
  let form = e.target.closest('form');
  if (form) {
    e.preventDefault();
    form.action = e.target.href;
    form.submit();
  }
});
