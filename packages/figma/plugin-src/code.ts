import "./codeImport/onDocumentChange";
//import "./responsive/onDocumentChange";
import "./responsive/onDocumentChange";
import "./onSelectionChange";
import "./icon/onDrop";
import "./rpc";

figma.showUI(__html__, { width: 240, height: 240 });

// TODO: load newly used fonts
function loadUsedFonts() {
  const nodes = figma.currentPage.findAll();
  const fonts: FontName[] = [];

  for (const node of nodes) {
    if (node.type === "TEXT") {
      fonts.push(...node.getRangeAllFontNames(0, node.characters.length));
    }
  }

  fonts.map((font) => void figma.loadFontAsync(font));
}
loadUsedFonts();
