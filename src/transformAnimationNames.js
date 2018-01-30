/* eslint no-param-reassign: [0] */

import { identity, reduce, update, add, getOr, flow, split, join, get, invert } from 'lodash/fp';


/* eslint-disable quote-props */
const initialRemainingKeywords = {
  'alternate': 1,
  'alternate-reverse': 1,
  'backwards': 1,
  'both': 1,
  'ease': 1,
  'ease-in': 1,
  'ease-in-out': 1,
  'ease-out': 1,
  'forwards': 1,
  'infinite': 1,
  'linear': 1,
  'none': Infinity, // No matter how many times you write none, it will never be an animation name
  'normal': 1,
  'paused': 1,
  'reverse': 1,
  'running': 1,
  'step-end': 1,
  'step-start': 1,
  'initial': Infinity,
  'inherit': Infinity,
  'unset': Infinity,
};
/* eslint-enable */

const validIdent = /^-?[_a-z][_a-z0-9-]*$/i;

const replaceAnimationNames = originalValueToTransformed => reduce((accum, value) => {
  const { remainingKeywords, didSetAnimationName } = accum;

  let transformedValue = value;

  if (!didSetAnimationName && validIdent.test(value)) {
    if (value in remainingKeywords && remainingKeywords[value] > 0) {
      accum.remainingKeywords = update(value, add(-1), remainingKeywords);
    } else {
      accum.didSetAnimationName = true;
      transformedValue = getOr(value, [value], originalValueToTransformed);
    }
  }

  accum.valueParts.push(transformedValue);

  return accum;
}, {
  didSetAnimationName: false,
  remainingKeywords: initialRemainingKeywords,
  valueParts: [],
});


module.exports = ({
  transform = identity,
  allowConflicts = false,
} = {}, root) => {
  const transformedToOriginalValue = {};

  const transformKeyframeNode = keyframeNode => {
    const { params } = keyframeNode;
    const transformedAnimationName = transform(params);

    if (!allowConflicts &&
      transformedAnimationName in transformedToOriginalValue &&
      transformedToOriginalValue[transformedAnimationName] !== params
    ) {
      throw new Error(`Expected ${params} to produce a consistent result`);
    }

    transformedToOriginalValue[transformedAnimationName] = params;
    keyframeNode.params = transformedAnimationName;
  };

  root.walkAtRules(/keyframes$/, transformKeyframeNode);

  const originalValueToTransformed = invert(transformedToOriginalValue);

  root.walkDecls(/animation-name$/, decl => {
    if (decl.value !== 'none' && decl.value in originalValueToTransformed) {
      decl.value = originalValueToTransformed[decl.value];
    }
  });

  root.walkDecls(/animation$/, decl => {
    decl.value = flow(
      split(/\s+/),
      replaceAnimationNames(originalValueToTransformed),
      get('valueParts'),
      join(' ')
    )(decl.value);
  });
};
