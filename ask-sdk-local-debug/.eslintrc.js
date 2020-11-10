module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "airbnb",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:eslint-comments/recommended",
    // Disable below extends and parser options if having performance issues
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    // ---------------------------------------------------------
    // --- Rules from eslint:recommended that we override
    // ---------------------------------------------------------
    "class-methods-use-this": [
      "error",
      { exceptMethods: ["errorEvent", "connectedEvent"] },
    ],
    "no-unused-vars": "off", // because it flags types that are imported for type declarations (but otherwise unused).
    "no-undef": "off", // because if flags lack of import for Set.  // TODO: fix the issues and remove this override.

    // ---------------------------------------------------------
    // --- Rules that we add and/or customize
    // ---------------------------------------------------------

    eqeqeq: ["error", "smart"],
    "guard-for-in": "error",
    "id-blacklist": [
      "error",
      "any",
      "Number",
      "number",
      "String",
      "string",
      "Boolean",
      "boolean",
      "Undefined",
      "undefined",
    ],
    "id-match": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/no-cycle": "off",
    "import/no-default-export": "error",
    "import/no-dynamic-require": "off",
    "import/no-extraneous-dependencies": ["off", { devDependencies: false }],
    "import/prefer-default-export": "off",
    indent: "off",
    "jsx-a11y/control-has-associated-label": "off",
    "jsx-a11y/label-has-associated-control": "off",
    "new-parens": "error",
    "no-caller": "error",
    "no-console": "off",
    "no-duplicate-imports": "error",
    "no-eval": "error",
    "no-extra-bind": "error",
    "no-new-func": "error",
    "no-new-wrappers": "error",
    "no-return-await": "error",
    "no-sequences": "error",
    "no-shadow": ["off", { hoist: "all" }],
    "no-undef-init": "error",
    "no-underscore-dangle": [
      "error",
      {
        allowAfterThis: true,
      },
    ],
    "global-require": 0,
    "no-var": "error",
    "object-shorthand": "error",
    "one-var": ["error", "never"],
    "prefer-const": "error",
    "prefer-object-spread": "error",
    radix: "error",

    "@typescript-eslint/strict-boolean-expressions": ["error"], // avoids frequent sources of errors: 0, "", Promise<T>, null vs undefined
    "@typescript-eslint/adjacent-overload-signatures": "error",
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          Object: {
            message: "Avoid using the `Object` type. Did you mean `object`?",
          },
          Function: {
            message:
              "Avoid using the `Function` type. Prefer a specific function type, like `() => void`.",
          },
          Boolean: {
            message: "Avoid using the `Boolean` type. Did you mean `boolean`?",
          },
          Number: {
            message: "Avoid using the `Number` type. Did you mean `number`?",
          },
          String: {
            message: "Avoid using the `String` type. Did you mean `string`?",
          },
          Symbol: {
            message: "Avoid using the `Symbol` type. Did you mean `symbol`?",
          },
        },
      },
    ],
    "@typescript-eslint/consistent-type-assertions": "error",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      { accessibility: "explicit" },
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-floating-promises": ["error"], // prevent those nasty forgotten promises !
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",
    "@typescript-eslint/triple-slash-reference": [
      "error",
      {
        path: "always",
        types: "prefer-import",
        lib: "always",
      },
    ],
    "@typescript-eslint/type-annotation-spacing": "error",
    "@typescript-eslint/unified-signatures": "error",

    // -- Rules form tsdoc
    // "tsdoc/syntax": "warn", // TODO: enable once we have better tsdoc coverage
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    // Disable below extends and parser options if having performance issues
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
    tsconfigRootDir: __dirname,
    project: "./tsconfig.json",
  },
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      // use <root>/tsconfig.json
      typescript: {
        // "alwaysTryTypes": true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`,
        // "directory": "./"
      },
    },
  },
};
