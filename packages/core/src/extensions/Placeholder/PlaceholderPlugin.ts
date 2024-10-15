// import { Plugin, PluginKey } from "prosemirror-state";
// import { Decoration, DecorationSet } from "prosemirror-view";
// import type { BlockNoteEditor } from "../../editor/BlockNoteEditor.js";

// const PLUGIN_KEY = new PluginKey(`blocknote-placeholder`);

// export const PlaceholderPlugin = (
//   editor: BlockNoteEditor<any, any, any>,
//   placeholders: Record<string | "default", string>
// ) => {
//   return new Plugin({
//     key: PLUGIN_KEY,
//     view: () => {
//       const styleEl = document.createElement("style");
//       const nonce = editor._tiptapEditor.options.injectNonce;
//       if (nonce) {
//         styleEl.setAttribute("nonce", nonce);
//       }
//       if (editor._tiptapEditor.view.root instanceof ShadowRoot) {
//         editor._tiptapEditor.view.root.append(styleEl);
//       } else {
//         editor._tiptapEditor.view.root.head.appendChild(styleEl);
//       }

//       const styleSheet = styleEl.sheet!;

//       const getBaseSelector = (additionalSelectors = "") =>
//         `.bn-block-content${additionalSelectors} .bn-inline-content:has(> .ProseMirror-trailingBreak:only-child):before`;

//       const getSelector = (
//         blockType: string | "default",
//         mustBeFocused = true
//       ) => {
//         const mustBeFocusedSelector = mustBeFocused
//           ? `[data-is-empty-and-focused]`
//           : ``;

//         if (blockType === "default") {
//           return getBaseSelector(mustBeFocusedSelector);
//         }

//         const blockTypeSelector = `[data-content-type="${blockType}"]`;
//         return getBaseSelector(mustBeFocusedSelector + blockTypeSelector);
//       };

//       for (const [blockType, placeholder] of Object.entries(placeholders)) {
//         const mustBeFocused = blockType === "default";

//         styleSheet.insertRule(
//           `${getSelector(blockType, mustBeFocused)}{ content: ${JSON.stringify(
//             placeholder
//           )}; }`
//         );

//         // For some reason, the placeholders which show when the block is focused
//         // take priority over ones which show depending on block type, so we need
//         // to make sure the block specific ones are also used when the block is
//         // focused.
//         if (!mustBeFocused) {
//           styleSheet.insertRule(
//             `${getSelector(blockType, true)}{ content: ${JSON.stringify(
//               placeholder
//             )}; }`
//           );
//         }
//       }

//       return {
//         destroy: () => {
//           if (editor._tiptapEditor.view.root instanceof ShadowRoot) {
//             editor._tiptapEditor.view.root.removeChild(styleEl);
//           } else {
//             editor._tiptapEditor.view.root.head.removeChild(styleEl);
//           }
//         },
//       };
//     },
//     props: {
//       // TODO: maybe also add placeholder for empty document ("e.g.: start writing..")
//       decorations: (state) => {
//         const { doc, selection } = state;

//         if (!editor.isEditable) {
//           return;
//         }

        // if (!selection.empty) {
        //   return;
        // }

        // const $pos = selection.$anchor;
        // const node = $pos.parent;

//         if (node.content.size > 0) {
//           return null;
//         }

//         const before = $pos.before();

//         const dec = Decoration.node(before, before + node.nodeSize, {
//           "data-is-empty-and-focused": "true",
//         });

//         return DecorationSet.create(doc, [dec]);
//       },
//     },
//   });
// };

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
          let isSelected = false;
          state.doc.nodesBetween(selection.from, selection.to, (_, selPos) => {
            if (selPos === pos) {
              isSelected = true;
            }
          });
          
          const $pos = selection.$anchor;
          const nodeS = $pos.parent;
          const before = $pos.before();
          console.log('pos', $pos, nodeS);
          

          if (!isSelected) {
            return;
          }
          console.log('hello', pos, isSelected, doc);
          
          if (node.isTextblock && node.content.size === 0) {
            const placeholder = placeholders['default'];
            if (placeholder) {
              const widget = Decoration.widget(pos + 1, () => {
                const placeholderEl = document.createElement("span");
                placeholderEl.className = "placeholder";
                placeholderEl.style.pointerEvents = "none";
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
        update: (view, prevState) => {
          const { state } = view;
          const { from, to } = state.selection;
          const decorations: Decoration[] = [];
          console.log(view.state.tr.getMeta(PLUGIN_KEY));
          

          // const currentBlockPos = state.selection.$anchor.blockRange()?.start;

          // if (prevState.selection.$anchor.blockRange()?.start !== currentBlockPos) {
            

          //   state.doc.nodesBetween(from, to, (node, pos) => {
          //     if (node.isTextblock && node.content.size === 0) {
          //       const placeholder = placeholders[node.attrs['data-content-type']] || placeholders['default'];
          //       if (placeholder) {
          //         const widget = Decoration.widget(pos + 1, () => {
          //           const placeholderEl = document.createElement("span");
          //           placeholderEl.className = "placeholder";
          //           placeholderEl.style.pointerEvents = "none";
          //           placeholderEl.textContent = placeholder;
          //           return placeholderEl;
          //         }, { side: -1 });
          //         decorations.push(widget);
          //       }
          //     }
          //   });

          //   view.dispatch(view.state.tr.setMeta(PLUGIN_KEY, { add: decorations }));
          // }
        },
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