import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { useEffect, useState } from "react";
import { buttonClass } from "../../../classNames";

export function ReadonlyPlugin() {
  const [editor] = useLexicalComposerContext();
  return (
    <button
      className={buttonClass}
      onClick={() => {
        editor.update(() => {
          editor.setReadOnly(!editor._readOnly);
          editor.blur()
        });
      }}
    >
      Toggle preview
    </button>
  );
}