import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  markdown: {
    overrides: {
      'ts/no-redeclare': 'off',
    },
  },
})
