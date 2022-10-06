import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { mergeRegister } from "@lexical/utils";
import { $isLineBreakNode, SerializedLexicalNode, SerializedTextNode } from "lexical";
import { SerializedParagraphNode } from "lexical/nodes/LexicalParagraphNode";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../../../lib/useLocalStorage";
import { SerializedConditionNode } from "../condition/ConditionNode";
import { SerializedConditionUINode } from "../condition/ConditionUiNode";
import { SerializedOptionNode } from "../question/OptionNode";
import { SerializedQuestionNode } from "../question/QuestionNode";
import { SerializedQuestionTitleNode } from "../question/QuestionTitle";
import { useReadonly } from "../readonly/useReadonly";

type SerializedRootChild =
  | SerializedParagraphNode
  | SerializedQuestionNode
  | SerializedConditionNode;

type SerializedRootNode = {
  children: SerializedRootChild[];
};

const $isSerializedQuestionNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedQuestionNode => serNode.type === "question";

const $isSerializedConditionNode = (
  serNode: any
): serNode is SerializedConditionNode => serNode.type === "condition";

const $isSerializedConditionUiNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedConditionUINode => serNode.type === "condition-ui";

const $isSerializedParagraphNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedParagraphNode => serNode.type === "paragraph";

const $isSerializedQuestionTitleNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedQuestionTitleNode => serNode.type === "question-title";

const $isSerializedOptionNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedOptionNode => serNode.type === "option";

const $isSerializedTextNode = (
  serNode: SerializedLexicalNode
): serNode is SerializedTextNode => serNode.type === "text";


type SerializedWithChildren = SerializedConditionNode | SerializedRootNode

const $isSerializedWithChildren = (serNode: any): serNode is SerializedWithChildren  => serNode?.children != null

type FormState = { [key: string]: string };

const FormPreview = ({ rootNode }: { rootNode: SerializedWithChildren }) => {
  const [formState, setFormState] = useLocalStorage<FormState>(
    `condition-${
      $isSerializedConditionNode(rootNode) ? rootNode.questionId : "root"
    }`,
    {}
  );

  if ($isSerializedWithChildren(rootNode)) {
    return (
      <div className={`relative w-full py-4`}>
        {rootNode.children.map((child, index) => {
          if ($isSerializedQuestionNode(child)) {
            const serializedQuestionTitleNode = child.children.find((_c) =>
              $isSerializedQuestionTitleNode(_c)
            ) as SerializedQuestionTitleNode;
            const questionId = child.id;
            const questionTitleText = serializedQuestionTitleNode?.children
              .map((_c) => {
                if ($isSerializedTextNode(_c)) {
                  return _c.text;
                }
              })
              .join("");

            return (
              <fieldset
                key={`node-${index}`}
                className="rounded p-3 border mb-5"
              >
                {child.children.map((qChild, qChildIndex) => {
                  if ($isSerializedOptionNode(qChild)) {
                    const text = qChild.children
                      .map((_c) => {
                        if ($isSerializedTextNode(_c)) {
                          return _c.text;
                        }
                      })
                      .join("");
                    return (
                      <label
                        className="p-2 pr-3"
                        key={`node-${index}-${qChildIndex}`}
                      >
                        <input
                          name={`question-${questionId}`}
                          type="radio"
                          checked={formState[questionId] === qChild.id}
                          onChange={(e) => {
                            setFormState((formState) => ({
                              ...formState,
                              [questionId]: qChild.id,
                            }));
                          }}
                          className="mr-2"
                        />
                        {text}
                      </label>
                    );
                  } else if ($isSerializedQuestionTitleNode(qChild)) {
                    return (
                      <legend
                        key={`node-${index}-${qChildIndex}`}
                        className="p-1 text-sm"
                      >
                        {questionTitleText}
                      </legend>
                    );
                  }
                  return <>{null}</>;
                })}
              </fieldset>
            );
          } else if ($isSerializedConditionNode(child)) {
            if (formState[child.questionId] === child.optionId) {
              return (
                <FormPreview rootNode={child} />
              );
            } else {
              return <>{null}</>
            }
          } else if ($isSerializedConditionUiNode(child)) {
            return null;
          } else if ($isSerializedParagraphNode(child)) {
            return (
              <p key={`node-${index}`} className="my-2">
                {child.children
                  .map((pChild: any) => pChild?.text || "")
                  .join("")}
              </p>
            );
          } else {
            return null;
            // <p className="text-red">Not parsed {child.type}</p>;
          }
        })}
      </div>
    );
  } else {
    return <>{null}</>;
  }
};

export function PreviewPlugin() {
  const readOnly = useReadonly();
  const [editor] = useLexicalComposerContext();
  const [rootNode, setRootNode] = useState<SerializedRootNode>();
  useEffect(() => {
    const rootNode = editor.getEditorState().toJSON()
      .root as unknown as SerializedRootNode;
    setRootNode(rootNode);
    return mergeRegister(
      editor.registerTextContentListener(() => {
        const rootNode = editor.getEditorState().toJSON()
          .root as unknown as SerializedRootNode;
        setRootNode(rootNode);
      })
    );
  }, [editor, readOnly]);

  return (
    <>
      {readOnly && rootNode != null && (
        <div className="pt-9 px-5">
          <FormPreview rootNode={rootNode} />
        </div>
      )}
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className={`relative pt-20 h-full outline-none w-full p-7 ${
              readOnly ? "hidden" : ""
            }`}
          />
        }
        placeholder={<div className="placeholder">Type something</div>}
      />
    </>
  );
}