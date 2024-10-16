import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import type { BlockNoteEditor } from "../../editor/BlockNoteEditor.js";

const PLUGIN_KEY = new PluginKey(`blocknote-placeholder`);

export const PlaceholderPlugin = (
  editor: BlockNoteEditor<any, any, any>,
  placeholders: Record<string | "default", string>
) => {
  return new Plugin({
    key: PLUGIN_KEY,
    state: {
      init: (_, { doc }) => DecorationSet.create(doc, []),
      apply: (tr, old) => {
        if (tr.docChanged || tr.selection) {
          return DecorationSet.empty;
        }
        return old.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state) => {
        const { doc, selection } = state;
        const decorations: Decoration[] = [];

        if (!editor.isEditable) {
          return DecorationSet.empty;
        }

        doc.descendants((node, pos) => {
          const $pos = selection.$anchor;
          const parentNode = $pos.parent;
          const before = $pos.before();

          if (before !== pos || parentNode.type.name !== 'paragraph') {
            return;
          }
          
          if (node.isTextblock && node.content.size === 0) {
            const placeholder = placeholders['default'];
            if (placeholder) {
              const widget = Decoration.widget(pos + 1, () => {
                const placeholderEl = document.createElement("span");
                placeholderEl.className = "placeholder";
                placeholderEl.textContent = placeholder;
                return placeholderEl;
              }, { side: -1 });
              decorations.push(widget);
            }
          }
        });

        return DecorationSet.create(doc, decorations);
      },
    },
    view: () => {
      const styleEl = document.createElement("style");
      const nonce = editor._tiptapEditor.options.injectNonce;
      if (nonce) {
        styleEl.setAttribute("nonce", nonce);
      }
      if (editor._tiptapEditor.view.root instanceof ShadowRoot) {
        editor._tiptapEditor.view.root.append(styleEl);
      } else {
        editor._tiptapEditor.view.root.head.appendChild(styleEl);
      }

      const styleSheet = styleEl.sheet!;

      const getBaseSelector = (additionalSelectors = "") =>
        `.bn-block-content${additionalSelectors} .bn-inline-content:has(> .ProseMirror-trailingBreak:only-child):before`;

      const getSelector = (
        blockType: string | "default",
        mustBeFocused = true
      ) => {
        const mustBeFocusedSelector = mustBeFocused
          ? `[data-is-empty-and-focused]`
          : ``;

        if (blockType === "default") {
          return getBaseSelector(mustBeFocusedSelector);
        }

        const blockTypeSelector = `[data-content-type="${blockType}"]`;
        return getBaseSelector(mustBeFocusedSelector + blockTypeSelector);
      };

      for (const [blockType, placeholder] of Object.entries(placeholders)) {
        const mustBeFocused = blockType === "default";

        styleSheet.insertRule(
          `${getSelector(blockType, mustBeFocused)}{ content: ${JSON.stringify(
            placeholder
          )}; }`
        );

        if (!mustBeFocused) {
          styleSheet.insertRule(
            `${getSelector(blockType, true)}{ content: ${JSON.stringify(
              placeholder
            )}; }`
          );
        }
      }

      return {
        destroy: () => {
          if (editor._tiptapEditor.view.root instanceof ShadowRoot) {
            editor._tiptapEditor.view.root.removeChild(styleEl);
          } else {
            editor._tiptapEditor.view.root.head.removeChild(styleEl);
          }
        },
      };
    },
  });
};