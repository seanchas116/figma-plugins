const docgen = require("react-docgen-typescript");

const options = {
  savePropValueAsString: true,
};

// Parse a file for docgen info
console.log(
  JSON.stringify(docgen.parse("./src/stories/Button.tsx", options), null, 2)
);
