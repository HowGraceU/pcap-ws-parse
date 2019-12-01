import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.cjs.js',
      format: 'cjs',
    },
    {
      file: './dist/index.esm.js',
      format: 'esm',
    },
  ],
  plugins: [
    resolve({
      extensions: ['.ts'],
    }),
    babel({
      runtimeHelpers: true,
      include: ['src/**/*.*'],
      plugins: ['@babel/plugin-transform-runtime'],
      extensions: ['.ts'],
    }),
  ],
};
