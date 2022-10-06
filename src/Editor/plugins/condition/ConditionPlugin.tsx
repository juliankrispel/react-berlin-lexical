import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestBlockElementAncestorOrThrow, $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $createParagraphNode, $getNodeByKey, $getSelection, $isParagraphNode, $isRangeSelection, $isRootNode, COMMAND_PRIORITY_HIGH, createCommand, KEY_ENTER_COMMAND } from "lexical";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { buttonClass } from "../../../classNames";
import { OptionNode } from "../question/OptionNode";
import { $createQuestionNode } from "../question/QuestionNode";
import { useQuestions } from "../question/useQuestions";
import { $createConditionNode, $isConditionNode, ConditionNode } from "./ConditionNode";
import { $createConditionUiNode, $isConditionUiNode } from "./ConditionUiNode";

const INSERT_CONDITION = createCommand();

export function ConditionPlugin() {
  const [editor] = useLexicalComposerContext();
  const questions = useQuestions();
  const question = questions[0]

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        INSERT_CONDITION,
        (payload, editor) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && question != null) {
              const conditionNode = $createConditionNode(question.id)
              const blockElement = $getNearestBlockElementAncestorOrThrow(
                selection.anchor.getNode()
              );
              
              blockElement.insertAfter(conditionNode);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed())
            return false;

          const anchorNode = selection.anchor.getNode();
          const textContent = anchorNode.getTextContent();
          const isNodeEmpty = textContent === "";

          const isOption = $getNearestNodeOfType(anchorNode, OptionNode);
          // Bail if current node is an option or if node isn't empty
          if (isOption || !isNodeEmpty) return false;

          const parentCondition = $getNearestNodeOfType(anchorNode, ConditionNode);
          parentCondition?.insertAfter(anchorNode);
          event?.preventDefault();
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerNodeTransform(ConditionNode, (node) => {
        const nodeKey = node.getKey();
        editor.update(
          () => {
            const _node = $getNodeByKey(nodeKey) as ConditionNode
            if (!_node) return;
            const firstChild = _node.getFirstChild();
            if (!firstChild || !$isConditionUiNode(firstChild)) {
              firstChild
                ? firstChild.insertBefore($createConditionUiNode())
                : _node.append($createConditionUiNode());
            }
          
            const hasParagraphNodes = _node
              .getChildren()
              .some((child) => $isParagraphNode(child));

            if (!hasParagraphNodes) {
              _node.append($createParagraphNode());
            }

            let parent = _node.getParent();
            while (
              parent != null &&
              !$isRootNode(parent) &&
              !$isConditionNode(parent)
            ) {
              parent.insertAfter(_node);
              parent = _node.getParent();
            }
          },
          { skipTransforms: true }
        );
      })
    );
    return unregister;
  }, [editor, question]);

  return (
    <button
      className={buttonClass}
      disabled={questions.length === 0}
      onClick={() => {
        editor.dispatchCommand(INSERT_CONDITION, null);
      }}
    >
      Add condition
    </button>
  );
}
