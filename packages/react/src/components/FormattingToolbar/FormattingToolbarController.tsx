import {
  BlockSchema,
  DefaultProps,
  InlineContentSchema,
  StyleSchema,
} from "@blocknote/core";
import { flip, offset } from "@floating-ui/react";
import { FC, useMemo, useRef, useState } from "react";

import { useBlockNoteEditor } from "../../hooks/useBlockNoteEditor.js";
import { useUIElementPositioning } from "../../hooks/useUIElementPositioning.js";
import { useUIPluginState } from "../../hooks/useUIPluginState.js";
import { mergeRefs } from "../../util/mergeRefs.js";
import { FormattingToolbar } from "./FormattingToolbar.js";
import { FormattingToolbarProps } from "./FormattingToolbarProps.js";
import {useEditorContentOrSelectionChange} from "../../hooks/useEditorContentOrSelectionChange.js";

const textAlignmentToPlacement = (
  textAlignment: DefaultProps["textAlignment"]
) => {
  switch (textAlignment) {
    case "left":
      return "top-start";
    case "center":
      return "top";
    case "right":
      return "top-end";
    default:
      return "top-start";
  }
};

export const FormattingToolbarController = (props: {
  formattingToolbar?: FC<FormattingToolbarProps>;
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const editor = useBlockNoteEditor<
    BlockSchema,
    InlineContentSchema,
    StyleSchema
  >();

  const [placement, setPlacement] = useState<"top-start" | "top" | "top-end">(
    () => {
      const block = editor.getTextCursorPosition().block;

      if (!("textAlignment" in block.props)) {
        return "top-start";
      }

      return textAlignmentToPlacement(
        block.props.textAlignment as DefaultProps["textAlignment"]
      );
    }
  );

  useEditorContentOrSelectionChange(() => {
    const block = editor.getTextCursorPosition().block;

    if (!("textAlignment" in block.props)) {
      setPlacement("top-start");
    } else {
      setPlacement(
        textAlignmentToPlacement(
          block.props.textAlignment as DefaultProps["textAlignment"]
        )
      );
    }
  }, editor);

  const state = useUIPluginState(
    editor.formattingToolbar.onUpdate.bind(editor.formattingToolbar)
  );

  const { isMounted, ref, style, getFloatingProps } = useUIElementPositioning(
    state?.show || false,
    state?.referencePos || null,
    3000,
    {
      placement,
      middleware: [
        offset(10),
        flip({
          mainAxis: true,
          crossAxis: true,
        }),
        {
          name: "detectOverflow",
          async fn(state) {
              const boundaryContainer = document.querySelector(".ProseMirror.bn-editor")!;
              const editorContainer = document.querySelector('.bn-container.bn-mantine')!;
              const boundaryRect = boundaryContainer.getBoundingClientRect();
              const editorRect = editorContainer.getBoundingClientRect();
              const padding = 10;
              let x = (state.rects.reference.x - editorRect.x) - state.rects.floating.width / 2;
              if (x < boundaryRect.left - editorRect.left) {
                x = boundaryRect.left - editorRect.left + padding;
              } else if (x > boundaryRect.right - editorRect.left - state.rects.floating.width) {
                x = boundaryRect.right - editorRect.left - state.rects.floating.width - padding;
              }
              return {
                x
              }
          },
        },
      ],
      onOpenChange: (open, _event) => {
        if (!open) {
          editor.formattingToolbar.closeMenu();
          editor.focus();
        }
      },
    }
  );

  const combinedRef = useMemo(() => mergeRefs([divRef, ref]), [divRef, ref]);

  if (!isMounted || !state) {
    return null;
  }

  if (!state.show && divRef.current) {
    // The component is fading out. Use the previous state to render the toolbar with innerHTML,
    // because otherwise the toolbar will quickly flickr (i.e.: show a different state) while fading out,
    // which looks weird
    return (
      <div
        ref={combinedRef}
        style={style}
        dangerouslySetInnerHTML={{ __html: divRef.current.innerHTML }}></div>
    );
  }

  const Component = props.formattingToolbar || FormattingToolbar;

  return (
    <div ref={combinedRef} style={style} {...getFloatingProps()}>
      <Component />
    </div>
  );
};
