import {
  EditorConfig,
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";

export type SerializedConditionNode = Spread<
  {
    type: "condition";
    questionId: string;
    optionId?: string;
    version: 1;
  },
  SerializedElementNode
>;

export type SerializedConditionQuestion = {
  text: string;
  id: string;
  options: { text: string; id: string }[];
};

export class ConditionNode extends ElementNode {
  __questionId: string;
  __optionId?: string;

  constructor(questionId: string, optionId?: string, key?: NodeKey) {
    super(key);
    this.__questionId = questionId;
    this.__optionId = optionId;
  }

  static getType() {
    return "condition" as const;
  }

  updateDOM(
    _prevNode: unknown,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    return false;
  }

  static clone(node: ConditionNode): ConditionNode {
    const newNode = new ConditionNode(node.__questionId, node.__optionId);
    return newNode;
  }

  static importJSON(serializedNode: SerializedConditionNode): ConditionNode {
    const node = $createConditionNode(
      serializedNode.questionId,
      serializedNode.optionId
    );
    return node;
  }

  exportJSON(): SerializedConditionNode {
    return {
      ...super.exportJSON(),
      type: ConditionNode.getType(),
      questionId: this.__questionId,
      optionId: this.__optionId,
      version: 1,
    };
  }

  setQuestionId(id: string) {
    const self = this.getWritable()
    self.__questionId = id;
  }

  setOptionId(id: string | undefined) {
    const self = this.getWritable();
    self.__optionId = id;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement("div");
    dom.className = config.theme[ConditionNode.getType()];
    return dom;
  }
}

export function $createConditionNode(
  questionId: string,
  optionId?: string
): ConditionNode {
  return new ConditionNode(questionId, optionId);
}

export function $isConditionNode(node?: LexicalNode): node is ConditionNode {
  return node instanceof ConditionNode;
}
