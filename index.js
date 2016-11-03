'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformAnimationNames = undefined;

var _fp = require('lodash/fp');

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable quote-props */
/* eslint no-param-reassign: [0] */

var initialRemainingKeywords = {
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
  'unset': Infinity
};
/* eslint-enable */

var validIdent = /^-?[_a-z][_a-z0-9-]*$/i;

var replaceAnimationNames = function replaceAnimationNames(originalValueToTransformed) {
  return (0, _fp.reduce)(function (accum, value) {
    var remainingKeywords = accum.remainingKeywords,
        didSetAnimationName = accum.didSetAnimationName;


    var transformedValue = value;

    if (!didSetAnimationName && validIdent.test(value)) {
      if (value in remainingKeywords && remainingKeywords[value] > 0) {
        accum.remainingKeywords = (0, _fp.update)(value, (0, _fp.add)(-1), remainingKeywords);
      } else {
        accum.didSetAnimationName = true;
        transformedValue = (0, _fp.getOr)(value, [value], originalValueToTransformed);
      }
    }

    accum.valueParts.push(transformedValue);

    return accum;
  }, {
    didSetAnimationName: false,
    remainingKeywords: initialRemainingKeywords,
    valueParts: []
  });
};

var transformAnimationNames = exports.transformAnimationNames = function transformAnimationNames() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$transform = _ref.transform,
      transform = _ref$transform === undefined ? _fp.identity : _ref$transform,
      _ref$allowConflicts = _ref.allowConflicts,
      allowConflicts = _ref$allowConflicts === undefined ? false : _ref$allowConflicts;

  var root = arguments[1];

  var transformedToOriginalValue = {};

  var transformKeyframeNode = function transformKeyframeNode(keyframeNode) {
    var params = keyframeNode.params;

    var transformedAnimationName = transform(params);

    if (!allowConflicts && transformedAnimationName in transformedToOriginalValue && transformedToOriginalValue[transformedAnimationName] !== params) {
      throw new Error('Expected ' + params + ' to produce a consistent result');
    }

    transformedToOriginalValue[transformedAnimationName] = params;
    keyframeNode.params = transformedAnimationName;
  };

  root.walkAtRules(/keyframes$/, transformKeyframeNode);

  var originalValueToTransformed = (0, _fp.invert)(transformedToOriginalValue);

  root.walkDecls(/animation-name$/, function (decl) {
    if (decl.value !== 'none' && decl.value in originalValueToTransformed) {
      decl.value = originalValueToTransformed[decl.value];
    }
  });

  root.walkDecls(/animation$/, function (decl) {
    decl.value = (0, _fp.flow)((0, _fp.split)(/\s+/), replaceAnimationNames(originalValueToTransformed), (0, _fp.get)('valueParts'), (0, _fp.join)(' '))(decl.value);
  });
};

exports.default = _postcss2.default.plugin('transform-animations', function (options) {
  return function (root) {
    return transformAnimationNames(options, root);
  };
});
