const docgen = require("react-docgen-typescript");

const options = {
  savePropValueAsString: true,
  componentNameResolver: (exp, source) => {
    console.log(exp, source);
    return exp.name;
  },
};

// Parse a file for docgen info
console.log(
  JSON.stringify(docgen.parse("./src/stories/Button.tsx", options), null, 2)
);
