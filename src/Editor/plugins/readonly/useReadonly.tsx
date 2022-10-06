import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { useState, useEffect } from "react";

export function useReadonly() {
  const [editor] = useLexicalComposerContext();
  const [readOnly, setReadOnly] = useState<boolean>();
  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerReadOnlyListener((readO) => {
        setReadOnly(readO);
      })
    );
    return unregister;
  }, [editor]);

  return readOnly;
}