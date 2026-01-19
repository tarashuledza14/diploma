import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/const/languages.ts',
    'src/types/languages.ts',
    'src/prisma/types.ts',
    'src/prisma/client.ts'
  ],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: true,
  clean: true,
  external: ['@prisma/client'],
});
