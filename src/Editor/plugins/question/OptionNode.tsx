import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { nanoid } from "nanoid";


export type SerializedOptionNode = Spread<
  {
    type: "option";
    id: string;
    version: 1;
  },
  SerializedElementNode
>;

export class OptionNode extends ElementNode {
  __id: string;

  constructor(id: string, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  static getType() {
    return "option" as const;
  }

  static clone(node: OptionNode): OptionNode {
    return $createOptionNode(node.__id);
  }

  static importJSON(serializedNode: SerializedOptionNode): OptionNode {
    const node = $createOptionNode(serializedNode.id);
    return node;
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    return false;
  }

  exportJSON(): SerializedOptionNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      type: OptionNode.getType(),
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("li");
    dom.className = config.theme[OptionNode.getType()];
    return dom;
  }
}

export function $createOptionNode(id: string): OptionNode {
  return new OptionNode(id);
}

export function $isOptionNode(
  node: LexicalNode | null | undefined | undefined
): boolean {
  return node instanceof OptionNode;
}
