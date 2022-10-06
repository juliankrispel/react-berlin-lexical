import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { LexicalEditor, EditorConfig, Spread, NodeKey, ElementFormatType, LexicalNode } from "lexical";
import { ConditionUi } from "./ConditionUi";

const conditionUiNodeType = "condition-ui" as const;

export type SerializedConditionUINode = Spread<
  {
    type: typeof conditionUiNodeType;
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

export class ConditionUiNode extends DecoratorBlockNode {
  static getType() {
    return conditionUiNodeType;
  }

  static clone(node: ConditionUiNode): ConditionUiNode {
    const newNode = new ConditionUiNode();
    return newNode;
  }

  static importJSON(serializedNode: SerializedConditionUINode) {
    const node = $createConditionUiNode();
    return node;
  }

  exportJSON(): SerializedConditionUINode {
    return {
      ...super.exportJSON(),
      type: ConditionUiNode.getType(),
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return <ConditionUi node={this} />;
  }
}

export function $createConditionUiNode(
  format?: ElementFormatType,
  key?: NodeKey
) {
  return new ConditionUiNode(format, key);
}

export function $isConditionUiNode(
  node?: LexicalNode
): node is ConditionUiNode {
  return node instanceof ConditionUiNode;
}
