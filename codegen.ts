import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://magento.test/graphql",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "src/lib/graphql/__generated__/types.ts": {
      plugins: ["typescript", "typescript-operations"],
      config: {
        skipTypename: false,
        scalars: {
          Float: "number",
          Int: "number",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
