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
  }
}
