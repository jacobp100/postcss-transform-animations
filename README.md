# postcss-transform-animations

```
npm install --save postcss-transform-animations
```

Transforms all animations in a CSS file.

```js
import { camelCase } from 'lodash';
import transformAnimations from 'postcss-transform-animations';

return postcss([
  transformAnimations({
    transform: camelCase,
  }),
])
  .process(...)
```

By default will throw if two different animations produce the same output. In the example above, an error would be thrown if you had `@keyframes foo-bar` and `@keyframes fooBar`. You can disable this by setting `allowConflicts: true`.

Will also replace `animation` and `animation-name` declarations to match transformed keyframe names (spec compliant).
