import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedQuestionTitleNode = Spread<
  {
    type: "question-title";
    version: 1;
  },
  SerializedElementNode
>;

export class QuestionTitleNode extends ElementNode {
  static getType() {
    return "question-title" as const;
  }

  static clone(node: QuestionTitleNode): QuestionTitleNode {
    return new QuestionTitleNode();
  }

  static importJSON(serializedNode: SerializedQuestionTitleNode): QuestionTitleNode {
    const node = $createQuestionTitleNode();
    return node;
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    return false;
  }

  exportJSON(): SerializedQuestionTitleNode {
    return {
      ...super.exportJSON(),
      type: QuestionTitleNode.getType(),
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = config.theme[QuestionTitleNode.getType()];
    return dom;
  }
}

export function $createQuestionTitleNode(): QuestionTitleNode {
  return new QuestionTitleNode();
}

export function $isQuestionTitleNode(
  node: LexicalNode | null | undefined | undefined
): boolean {
  return node instanceof QuestionTitleNode;
}
