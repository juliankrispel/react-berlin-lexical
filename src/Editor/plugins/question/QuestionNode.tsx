import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";
import { TextNode } from "lexical";

export type SerializedQuestionNode = Spread<
  {
    type: "question";
    id: string;
    version: 1;
  },
  SerializedElementNode
>;

export class QuestionNode extends ElementNode {
  __id: string;

  static getType() {
    return "question" as const;
  }
  constructor(id: string, key?: NodeKey) {
    super(key);

    this.__id = id;
  }

  static clone(node: QuestionNode): QuestionNode {
    return new QuestionNode(node.__id);
  }

  static importJSON(serializedNode: SerializedQuestionNode): QuestionNode {
    const node = $createQuestionNode(serializedNode.id);
    return node;
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    return false;
  }

  canInsertTextBefore(): boolean {
    return true;
  }

  exportJSON(): SerializedQuestionNode {
    return {
      ...super.exportJSON(),
      id: this.__id,
      type: QuestionNode.getType(),
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("ul");
    dom.className = config.theme[QuestionNode.getType()];
    return dom;
  }

  getId() {
    return this.__id;
  }
}

export function $createQuestionNode(id: string, key?: string): QuestionNode {
  return new QuestionNode(id, key);
}

export function $isQuestionNode(
  node: LexicalNode | null
): node is QuestionNode {
  return node instanceof QuestionNode;
}
