/* eslint-disable lodash/prefer-lodash-typecheck */
/* global _ */

if (typeof require !== 'undefined' && typeof _ === 'undefined') {
  /* global require */
  // eslint-disable-next-line no-global-assign, no-implicit-globals
  _ = require('lodash');
}


(function(init) {
  'use strict';
  /* eslint-disable no-undef */
  const isBrowser = typeof window !== 'undefined' && window.document;
  const isWebWorker = typeof self !== 'undefined' && typeof WorkerGlobalScope === 'function' &&
    self instanceof WorkerGlobalScope;
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  /* eslint-enable no-undef */
  const diffObjects = init();
  if (typeof angular !== 'undefined') {
    /* global angular */
    angular.module('diff-objects', []).constant('diffObjects', diffObjects);
  } else if (isNode) {
    /* global module */
    module.exports = {diffObjects};
  } else if (isWebWorker) {
    /* global self */
    self.diffObject = diffObjects;
  } else if (isBrowser) {
    /* global window */
    window.diffObject = diffObjects;
  } else {
    throw new Error('Unable to install diffObject - no recognizable global object found');
  }
})(() => {
  'use strict';

  function stringify(that) {
    let output = '' + JSON.stringify(that);
    if (output.length > 100) output = `${output.slice(0, 50)} […] ${output.slice(-50)}`;
    return output;
  }

  function diffProperty(o1, o2, key) {
    if (key in o1 && key in o2) return diffObjects(o1[key], o2[key]);
    return `${key in o1 ? stringify(o1[key]) : '∅'} → ${key in o2 ? stringify(o2[key]) : '∅'}`;
  }

  function diffObjects(o1, o2) {
    if (o1 === o2) return null;
    if (_.isArray(o1) && _.isArray(o2)) {
      const delta =
        _.map(o1.length >= o2.length ? o1 : o2, (ignored, i) => diffObjects(o1[i], o2[i]));
      return _.some(delta) ? delta : null;
    }
    if (_.isObject(o1) && _.isObject(o2)) {
      const delta = _(o1)
        .keys().concat(_.keys(o2)).keyBy()
        .mapValues(key => diffProperty(o1, o2, key))
        .pickBy().value();
      return _.isEmpty(delta) ? null : delta;
    }
    if (_.isEqual(o1, o2)) return null;
    return `${stringify(o1)} → ${stringify(o2)}`;
  }

  return diffObjects;
});
