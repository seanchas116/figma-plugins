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
    nodeState: NodeState;
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

    const createNodeState = (
      parentState: NodeState | undefined,
      node: Node
    ) => {
      const state = new NodeState(this, parentState, node);
      this.nodeStates.set(node.id, state);
      if ("children" in node) {
        for (const child of node.children) {
          createNodeState(state, child);
        }
      }
    };
    for (const node of rootNodes) {
      createNodeState(undefined, node);
    }

    this.artboards = rootNodes.map((node) => {
      return {
        nodeState: this.getNodeState(node.id),
        screenshotSVG: screenshots[node.id],
      };
    });

    if (this.artboards.length) {
      const firstNodeBBox = (this.artboards[0].nodeState.node as FrameNode)
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

  getNodeState(id: string): NodeState {
    const state = this.nodeStates.get(id);
    if (!state) {
      throw new Error(`NodeState not found: ${id}`);
    }
    return state;
  }

  deselectAll() {
    for (const artboard of this.artboards) {
      artboard.nodeState.deselect();
    }
  }
}

export class NodeState {
  constructor(
    inspectorState: InspectorState,
    parentState: NodeState | undefined,
    node: Node
  ) {
    this.inspectorState = inspectorState;
    this.parentState = parentState;
    this.node = node;
    makeObservable(this);
  }

  readonly inspectorState: InspectorState;
  readonly parentState: NodeState | undefined;
  readonly node: Node;

  get id(): string {
    return this.node.id;
  }

  get childStates(): NodeState[] {
    if ("children" in this.node) {
      return this.node.children.map((child) => {
        return this.inspectorState.getNodeState(child.id);
      });
    }
    return [];
  }

  @computed get hovered(): boolean {
    return this.inspectorState.hoveredNodeID == this.node.id;
  }

  @observable private _selected: boolean = false;

  get selected(): boolean {
    return this._selected;
  }

  @computed get ancestorSelected(): boolean {
    if (this._selected) {
      return true;
    }
    if (this.parentState) {
      return this.parentState.ancestorSelected;
    }
    return false;
  }

  select() {
    this._selected = true;
    if ("children" in this.node) {
      for (const child of this.childStates) {
        child.deselect();
      }
    }
  }

  deselect() {
    this._selected = false;
    if ("children" in this.node) {
      for (const child of this.childStates) {
        child.deselect();
      }
    }
  }
}
