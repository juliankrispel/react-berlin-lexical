import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { createEmptyHistoryState, HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorState, ParagraphNode } from "lexical";
import { ConditionNode } from "./plugins/condition/ConditionNode";
import { OptionNode } from "./plugins/question/OptionNode";
import { QuestionNode } from "./plugins/question/QuestionNode";
import { QuestionTitleNode } from "./plugins/question/QuestionTitle";
import { ConditionPlugin } from "./plugins/condition/ConditionPlugin";
import { QuestionPlugin } from "./plugins/question/QuestionPlugin";
import { ConditionUiNode } from "./plugins/condition/ConditionUiNode";
import { ReadonlyPlugin } from "./plugins/readonly/ReadonlyPlugin";
import { PreviewPlugin } from "./plugins/preview/PreviewPlugin";

const questionClassName =
  /*tw*/ "relative border-l-8 pl-2 pt-4 mb-2 max-w-md  before:content-['QUESTION'] before:text-xs before:text-slate-400 before:absolute before:top-0 before:left-3 border-green-300";
const optionClassName =
  /*tw*/ "pl-1 mt-2 text-sm list-inside list-[square] ";
const conditionClassName =
  /*tw*/ "relative border-l-8 pl-3 pt-5 mb-2 before:content-['CONDITION'] before:text-xs before:text-slate-400 before:absolute before:top-0 before:left-3 border-blue-400";
const paragraphClassName = "mb-2";

const questionTitleClassName = /*tw*/ "pl-1 text-lg";

export function Editor({
  initialState,
  onChange,
}: {
  initialState: Object;
  onChange?: (editorState: EditorState) => void;
}) {
  const history = createEmptyHistoryState();
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "test",
        readOnly: false,
        nodes: [
          ParagraphNode,
          QuestionNode,
          OptionNode,
          QuestionTitleNode,
          ConditionNode,
          ConditionUiNode,
        ],
        editorState: JSON.stringify(initialState),
        theme: {
          text: {
            underline: /*tw*/ "underline",
          },
          question: /*tw*/ questionClassName,
          "question-title": /*tw*/ questionTitleClassName,
          option: /*tw*/ optionClassName,
          condition: /*tw*/ conditionClassName,
          paragraph: paragraphClassName,
        },
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      <OnChangePlugin
        ignoreInitialChange
        ignoreSelectionChange
        onChange={(editorState) => {
          if (onChange) onChange(editorState);
        }}
      />
      <PreviewPlugin />
      <ClearEditorPlugin />
      <div className="fixed top-0 bg-slate-200 bg-opacity-75 border-b w-full">
        <ConditionPlugin />
        <QuestionPlugin />
        <ReadonlyPlugin />
      </div>
      <HistoryPlugin externalHistoryState={history} />
    </LexicalComposer>
  );
}