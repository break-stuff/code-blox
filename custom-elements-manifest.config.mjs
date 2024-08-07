import { getTsProgram, expandTypesPlugin } from 'cem-plugin-expanded-types';

export default {
  /** Globs to analyze */
  globs: ['src/components/**/*.ts'],
  /** Globs to exclude */
  exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts', 'src/**/*.styles.ts'],
  /** Enable special handling for litelement */
  litelement: true,
  /** Provide custom plugins */
  plugins: [expandTypesPlugin()],

  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },
};
