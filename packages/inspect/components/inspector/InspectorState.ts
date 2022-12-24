import { makeObservable, observable } from "mobx";
import type { Node } from "figma-api/lib/ast-types";
import type { GetFileResult } from "figma-api/lib/api-types";
import { Vec2 } from "paintvec";

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export class InspectorState {
  constructor(fileID: string) {
    this._accessToken = localStorage.getItem("figmaAccessToken") ?? "";
    this.fileID = fileID;
    makeObservable(this);
    this.fetchFigma();
  }

  readonly fileID: string;

  @observable private _accessToken = "";

  get accessToken() {
    return this._accessToken;
  }
  set accessToken(value: string) {
    this._accessToken = value;
    localStorage.setItem("figmaAccessToken", value);
  }

  @observable.ref document: Node<"DOCUMENT"> | undefined = undefined;
  @observable.ref rootNodes: {
    node: Node;
    screenshotSVG: string;
  }[] = [];

  async fetchFigma() {
    const response: GetFileResult = await (
      await fetch(`https://api.figma.com/v1/files/${this.fileID}`, {
        headers: {
          "X-Figma-Token": this._accessToken,
        },
      })
    ).json();

    this.document = response.document;

    const rootNodes = (this.document.children[0] as Node<"CANVAS">).children;

    const screenshots = await this.fetchScreenshotSVGs(rootNodes);

    this.rootNodes = rootNodes.map((node) => {
      return {
        node,
        screenshotSVG: screenshots[node.id],
      };
    });

    if (this.rootNodes.length) {
      const firstNodeBBox = (this.rootNodes[0].node as Node<"FRAME">)
        .absoluteBoundingBox;
      this.scroll = new Vec2(
        -(firstNodeBBox.x + firstNodeBBox.width / 2) + 320,
        -(firstNodeBBox.y + firstNodeBBox.height / 2) + 320
      );
    }
  }

  private async fetchScreenshotSVGs(nodes: Node[]): Promise<{
    [nodeID: string]: string;
  }> {
    const ids = nodes.map((node) => node.id).join(",");

    const response = await fetch(
      `https://api.figma.com/v1/images/${this.fileID}?ids=${ids}&format=svg`,
      {
        headers: {
          "X-Figma-Token": this._accessToken,
        },
      }
    );
    const json = await response.json();
    return json.images;
  }

  @observable.ref hoveredNode: Node | undefined = undefined;

  @observable.ref scroll = new Vec2(0);
}
