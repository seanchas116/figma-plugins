import docgen from "react-docgen-typescript";

const options: docgen.ParserOptions = {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  componentNameResolver: (exp, source) => {
    console.log(exp, source);
    return exp.name;
  },
};

// Parse a file for docgen info
console.log(
  JSON.stringify(docgen.parse("./src/stories/Button.tsx", options), null, 2)
);
