import * as fs from "fs";
import glob from "glob";
import docgen from "react-docgen-typescript";

const options: docgen.ParserOptions = {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  componentNameResolver: (exp, source) => {
    //console.log(exp, source);
    return exp.name;
  },
};

const filePath = "src/stories/*.tsx";
const ignoreFilePath = "**/*.stories.tsx";

const ignoreFilePaths = glob.sync(ignoreFilePath);
const filePaths = glob.sync(filePath, {
  ignore: ignoreFilePaths,
});

console.log(filePaths);

// Parse a file for docgen info
const docs = JSON.stringify(docgen.parse(filePaths, options), null, 2);

fs.writeFileSync("./src/docs.json", docs);
