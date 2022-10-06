import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  createCommand,
  KEY_ENTER_COMMAND,
} from "lexical";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { buttonClass } from "../../../classNames";
import { ConditionNode } from "../condition/ConditionNode";
import { $createOptionNode, $isOptionNode, OptionNode } from "./OptionNode";
import { $createQuestionNode, QuestionNode } from "./QuestionNode";
import {
  $createQuestionTitleNode,
  $isQuestionTitleNode,
  QuestionTitleNode,
} from "./QuestionTitle";

const INSERT_QUESTION = createCommand();

export function QuestionPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        INSERT_QUESTION,
        (payload, editor) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const questionNode = $createQuestionNode(nanoid());
              const blockElement = $getNearestBlockElementAncestorOrThrow(
                selection.anchor.getNode()
              );

              blockElement.insertAfter(questionNode);
            }
          });
          return true;
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerNodeTransform(QuestionNode, (node) => {
        editor.update(
          () => {
            const [firstChild, ...otherChildren] = node.getChildren();
            /**
             * Add question title node if it doesn't already exist
             */
            if (!firstChild || !$isQuestionTitleNode(firstChild)) {
              const titleNode = $createQuestionTitleNode();
              if (firstChild != null) {
                firstChild.insertBefore(titleNode);
              } else {
                node.append(titleNode);
              }
            }

            /**
             * Remove any children that aren't options
             */
            if (otherChildren.length > 0) {
              otherChildren.forEach((_node) => {
                if (!$isOptionNode(_node)) {
                  _node.remove();
                }
              });
            }
          },
          { skipTransforms: true }
        );
      }),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (payload) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed())
            return false;

          const anchorNode = selection.anchor.getNode();
          const parentNode = anchorNode.getParentOrThrow();
          const textContent = anchorNode.getTextContent();
          const isNodeEmpty = textContent === "";

          const optionOrTitleNode =
            $isOptionNode(anchorNode) || $isQuestionTitleNode(anchorNode)
              ? anchorNode
              : $getNearestNodeOfType(anchorNode, OptionNode) ||
                $getNearestNodeOfType(anchorNode, QuestionTitleNode);

          if (optionOrTitleNode && isNodeEmpty) {
            const paragraph = $createParagraphNode();
            payload?.preventDefault();
            paragraph.append();
            parentNode.insertAfter(paragraph);
            anchorNode.remove();
            paragraph.selectStart();
            return true;
          } else if (optionOrTitleNode) {
            const option = $createOptionNode(nanoid());
            payload?.preventDefault();

            if (
              $isQuestionTitleNode(optionOrTitleNode) &&
              selection.anchor.offset === 0
            ) {
              const rootNode = optionOrTitleNode.getParent();
              const pNode = $createParagraphNode();
              rootNode?.insertBefore(pNode);
              pNode.selectStart();
              return true;
            }
            if ($isTextNode(anchorNode)) {
              const siblingsAfter = anchorNode.getNextSiblings();
              const textNodes = anchorNode.splitText(
                ...selection.getCharacterOffsets()
              );

              if (textNodes.length > 1 || selection.anchor.offset === 0) {
                option.append(textNodes[textNodes.length - 1]);
              }
              option.append(...siblingsAfter);
            }

            optionOrTitleNode.insertAfter(option);
            option.selectStart();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
    return unregister;
  }, [editor]);

  return (
    <button
      className={buttonClass}
      onClick={() => {
        editor.dispatchCommand(INSERT_QUESTION, null);
      }}
    >
      Add question
    </button>
  );
}
