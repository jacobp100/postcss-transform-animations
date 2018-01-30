/* eslint no-param-reassign: [0] */

import postcss from 'postcss';
import transformAnimationNames from './transformAnimationNames';

export { transformAnimationNames };

export default postcss.plugin(
  'transform-animations',
  (options) => (root) => transformAnimationNames(options, root)
);
