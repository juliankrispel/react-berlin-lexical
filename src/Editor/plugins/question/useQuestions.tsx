import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $getNodeByKey, $getRoot, LexicalNode, NodeKey, RootNode } from "lexical";
import { useState, useCallback, useEffect } from "react";
import { $isConditionNode, ConditionNode, SerializedConditionQuestion } from "../condition/ConditionNode";
import { $isOptionNode, OptionNode } from "./OptionNode";
import { $isQuestionNode, QuestionNode } from "./QuestionNode";

export function useQuestions(nodeKey?: NodeKey) {
  const [editor] = useLexicalComposerContext();
  const [questions, setQuestions] = useState<SerializedConditionQuestion[]>([]);

  const updateQuestions = useCallback(() => {
    editor.getEditorState().read(() => {
      const node = nodeKey != null ? $getNodeByKey(nodeKey) : null;
      const parent = node?.getParent()?.getParent();
      const parentCondition =
        parent != null && $getNearestNodeOfType(parent, ConditionNode);
      const root = parentCondition
        ? $getNearestNodeOfType(parentCondition, ConditionNode)
        : $getRoot();
      if (root == null) return;
      setQuestions(
        root
          .getChildren()
          .filter($isQuestionNode)
          .map((_n: QuestionNode) => {
            return {
              key: _n.getKey(),
              id: _n.getId(),
              options: _n
                .getChildren()
                .filter($isOptionNode)
                .map((v) => ({
                  id: v.__id,
                  text: v.getTextContent(),
                })),
              text: _n.getFirstChild()?.getTextContent() || "",
            };
          })
      );
    });
  }, [editor, setQuestions]);

  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerRootListener(updateQuestions),
      // editor.registerMutationListener(RootNode, updateQuestions),
      editor.registerTextContentListener(updateQuestions)
    );
    return unregister;
  }, [editor, updateQuestions]);

  return questions;
}