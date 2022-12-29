import { computed, makeObservable, observable } from "mobx";
import { Vec2 } from "paintvec";
import type {
  CanvasNode,
  DocumentNode,
  FrameNode,
  Node,
} from "@uimix/figma-node";

function fileIDFromFigmaFileURL(fileURL: string): string | undefined {
  const match = fileURL.match(/https:\/\/www.figma.com\/file\/([^\/]*)/);
  if (!match) {
    return undefined;
  }
  return match[1];
}

export class InspectorState {
  constructor(fileID: string, accessToken: string) {
    this.fileID = fileID;
    this.accessToken = accessToken;
    makeObservable(this);
    this.fetchFigma();
  }

  readonly fileID: string;
  readonly accessToken: string;

  @observable.ref document: DocumentNode | undefined = undefined;
  @observable.ref artboards: {
    node: Node;
    screenshotSVG: string;
  }[] = [];

  async fetchFigma() {
    const response = await (
      await fetch(`https://api.figma.com/v1/files/${this.fileID}`, {
        headers: {
          Authorization: "Bearer " + this.accessToken,
        },
      })
    ).json();

    this.document = response.document as DocumentNode;

    const rootNodes = (this.document.children[0] as CanvasNode).children;

    const screenshots = await this.fetchScreenshotSVGs(rootNodes);

    this.artboards = rootNodes.map((node) => {
      return {
        node,
        screenshotSVG: screenshots[node.id],
      };
    });

    if (this.artboards.length) {
      const firstNodeBBox = (this.artboards[0].node as FrameNode)
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
          Authorization: "Bearer " + this.accessToken,
        },
      }
    );
    const json = await response.json();
    return json.images;
  }

  @observable hoveredNodeID: string | undefined = undefined;

  @observable.ref scroll = new Vec2(0);

  private readonly nodeStates = new Map<string, NodeState>();

  getNodeState(node: Node): NodeState {
    let state = this.nodeStates.get(node.id);
    if (!state) {
      state = new NodeState(this, node);
      this.nodeStates.set(node.id, state);
    }
    return state;
  }
}

export class NodeState {
  constructor(inspectorState: InspectorState, node: Node) {
    this.inspectorState = inspectorState;
    this.node = node;
    makeObservable(this);
  }

  readonly inspectorState: InspectorState;
  readonly node: Node;

  @computed get isHovered(): boolean {
    return this.inspectorState.hoveredNodeID == this.node.id;
  }
}
