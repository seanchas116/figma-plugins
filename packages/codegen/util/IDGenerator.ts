import { generateJSIdentifier, incrementAlphanumeric } from "./name";

export class IDGenerator {
  usedIDs = new Set<string>();

  generate(text: string) {
    let ret = generateJSIdentifier(text);

    while (this.usedIDs.has(ret.toLowerCase())) {
      ret = incrementAlphanumeric(ret);
    }

    this.usedIDs.add(ret.toLowerCase());

    return ret;
  }
}
