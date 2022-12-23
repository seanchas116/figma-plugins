import { makeObservable, observable } from "mobx";
import type { Node } from "figma-api/lib/ast-types";
import type { GetFileResult } from "figma-api/lib/api-types";

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export class InspectorState {
  constructor() {
    this._accessToken = localStorage.getItem("figmaAccessToken") ?? "";
    this._fileURL = localStorage.getItem("figmaFileURL") ?? "";
    makeObservable(this);
  }

  @observable private _accessToken = "";
  @observable private _fileURL = "";

  get accessToken() {
    return this._accessToken;
  }
  set accessToken(value: string) {
    this._accessToken = value;
    localStorage.setItem("figmaAccessToken", value);
  }

  get fileURL() {
    return this._fileURL;
  }
  set fileURL(value: string) {
    this._fileURL = value;
    localStorage.setItem("figmaFileURL", value);
  }

  @observable.ref document: Node<"DOCUMENT"> | undefined = undefined;
  @observable.ref rootNodes: {
    node: Node;
    screenshotSVG: string;
  }[] = [];

  async fetchFigma() {
    const fileID = fileIDFromFigmaFileURL(this._fileURL);
    console.log(fileID);
    if (!fileID) {
      return;
    }
    const response: GetFileResult = await (
      await fetch(`https://api.figma.com/v1/files/${fileID}`, {
        headers: {
          "X-Figma-Token": this._accessToken,
        },
      })
    ).json();

    this.document = response.document;

    const rootNodes = (this.document.children[0] as Node<"CANVAS">).children;

    this.rootNodes = await Promise.all(
      rootNodes.map(async (node) => {
        return {
          node,
          screenshotSVG: await this.fetchScreenshotSVG(node),
        };
      })
    );
  }

  private async fetchScreenshotSVG(node: Node): Promise<string> {
    const fileID = fileIDFromFigmaFileURL(this._fileURL);
    if (!fileID) {
      return "";
    }
    const response = await fetch(
      `https://api.figma.com/v1/images/${fileID}?ids=${node.id}&format=svg`,
      {
        headers: {
          "X-Figma-Token": this._accessToken,
        },
      }
    );
    const json = await response.json();
    return json.images[node.id];
  }
}
