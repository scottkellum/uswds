const assign = require('object-assign');
const { keymap } = require('receptor');
const behavior = require('./behavior');
const select = require('./select');
const activeElement = require('./active-element');

const FOCUSABLE = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

module.exports = (context, additionalKeyBindings = {}) => {
  const focusableElements = select(FOCUSABLE, context);
  const firstTabStop = focusableElements[0];
  const lastTabStop = focusableElements[focusableElements.length - 1];

  // Special rules for when the user is tabbing forward from the last focusable element,
  // or when tabbing backwards from the first focusable element
  function tabAhead(event) {
    if (activeElement() === lastTabStop) {
      event.preventDefault();
      firstTabStop.focus();
    }
  }

  function tabBack(event) {
    if (activeElement() === firstTabStop) {
      event.preventDefault();
      lastTabStop.focus();
    }
  }

  //  TODO: In the future, loop over additional keybindings and pass an array
  // of functions, if necessary, to the map keys. Then people implementing
  // the focus trap could pass callbacks to fire when tabbing
  const keyMappings = keymap(assign({
    Tab: tabAhead,
    'Shift+Tab': tabBack,
  }, additionalKeyBindings));

  const focusTrap = behavior({
    keydown: keyMappings,
  }, {
    init() {
      // TODO: is this desireable behavior?
      firstTabStop.focus();
    },
  });

  return focusTrap;
};
