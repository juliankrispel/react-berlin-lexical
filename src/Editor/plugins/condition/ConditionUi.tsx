import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";
import { useQuestions } from "../question/useQuestions";
import { useReadonly } from "../readonly/useReadonly";
import { $isConditionNode } from "./ConditionNode";
import { ConditionUiNode } from "./ConditionUiNode";

export function ConditionUi({ node }: { node: ConditionUiNode; }) {
  const questions = useQuestions(node.getKey());
  const [editor] = useLexicalComposerContext();
  const [condition, setCondition] = useState<{
    questionId: string;
    optionId?: string;
  }>();
  const readOnly = useReadonly();
  const question = questions.find((q) => condition?.questionId === q.id);

  const option = question?.options.find(opt => opt.id === condition?.optionId);

  useEffect(() => {
    editor.getEditorState().read(() => {
      const parentNode = node.getParent();
      if (parentNode != null && $isConditionNode(parentNode)) {
        setCondition({
          questionId: parentNode.__questionId,
          optionId: parentNode.__optionId,
        });
      }
    });
  }, [node]);

  if (readOnly) {
    return (
      <>
        Show if "{question?.text}" equals "{option?.text}"
      </>
    );
  }

  return (
    <span className="text-sm text-slate-500 ">
      Show if{" "}
      <select
        value={condition?.questionId}
        onChange={(event) => {
          editor.update(() => {
            const parentNode = node.getParent();
            if (parentNode != null) {
              parentNode.setQuestionId(event.target.value);
            }
          });
        }}
      >
        <option>--</option>
        {questions.map((question) => (
          <option key={question.id} value={question.id}>
            {question.text}
          </option>
        ))}
      </select>
      {question != null && (
        <>
          {" "}
          equals{" "}
          <select
            value={condition?.optionId}
            onChange={(event) => {
              editor.update(() => {
                const parentNode = node.getParent();
                if (parentNode != null && $isConditionNode(parentNode)) {
                  parentNode.setOptionId(event.target.value);
                }
              });
            }}
          >
            <option>--</option>
            {question.options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.text}
              </option>
            ))}
          </select>
        </>
      )}
    </span>
  );
}
