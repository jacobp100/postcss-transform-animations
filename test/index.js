import { camelCase, upperCase, constant } from 'lodash/fp';
import test from 'ava';
import postcss from 'postcss';
import transformAnimations from '../src';


test.serial('transforms animation names', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: camelCase,
    }),
  ])
    .process('@keyframes foo-bar {}')
    .then(({ css }) => {
      t.is(css, '@keyframes fooBar {}');
    });
});

test.serial('throws by default for colliding animation names', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: constant('fooBar'),
    }),
  ])
    .process('@keyframes foo-bar {} @keyframes fooBar {}')
    .catch(() => {
      t.pass();
    });
});

test.serial('does not throw for colliding animation names if overridden', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: constant('fooBar'),
      allowConflicts: true,
    }),
  ])
    .process('@keyframes foo-bar {} @keyframes fooBar {}')
    .then(() => {
      t.pass();
    });
});

test.serial('does not throw for colliding animation names if names are identical', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: camelCase,
    }),
  ])
    .process('@keyframes foo-bar {} @keyframes foo-bar {}')
    .then(() => {
      t.pass();
    });
});

test.serial('replaces references in animation-name declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: camelCase,
    }),
  ])
    .process('@keyframes foo-bar {} p { animation-name: foo-bar; }')
    .then(({ css }) => {
      t.is(css, '@keyframes fooBar {} p { animation-name: fooBar; }');
    });
});

test.serial('does not replace keywords in animation-name declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: upperCase,
    }),
  ])
    .process('@keyframes none {} p { animation-name: none; }')
    .then(({ css }) => {
      t.is(css, '@keyframes NONE {} p { animation-name: none; }');
    });
});

test.serial('replaces references in animation declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: camelCase,
    }),
  ])
    .process('@keyframes foo-bar {} p { animation: foo-bar; }')
    .then(({ css }) => {
      t.is(css, '@keyframes fooBar {} p { animation: fooBar; }');
    });
});

test.serial('complies with spec on keywords in animation declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: upperCase,
    }),
  ])
    .process('@keyframes linear {} p { animation: linear linear; }')
    .then(({ css }) => {
      t.is(css, '@keyframes LINEAR {} p { animation: linear LINEAR; }');
    });
});

test.serial('complies with spec on keywords in animation declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: upperCase,
    }),
  ])
    .process('@keyframes linear {} p { animation: linear ease-in linear infinite; }')
    .then(({ css }) => {
      t.is(css, '@keyframes LINEAR {} p { animation: linear ease-in LINEAR infinite; }');
    });
});

test.serial('complies with spec on keywords in animation declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: camelCase,
    }),
  ])
    .process('@keyframes not-transformed {} p { animation: linear linear not-transformed; }')
    .then(({ css }) => {
      t.is(css, '@keyframes notTransformed {} p { animation: linear linear not-transformed; }');
    });
});

test.serial('does not replace "none" in animation declarations', t => {
  t.plan(1);

  return postcss([
    transformAnimations({
      transform: upperCase,
    }),
  ])
    .process('@keyframes none {} p { animation: none none none; }')
    .then(({ css }) => {
      t.is(css, '@keyframes NONE {} p { animation: none none none; }');
    });
});
