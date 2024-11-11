import { Plugin, PluginKey, TextSelection } from "prosemirror-state";

const PLUGIN_KEY = new PluginKey('openImiAIPlugin');

export const OpenImiAIPlugin = () => {
  return new Plugin({
    key: PLUGIN_KEY,
    props: {
      handleKeyDown(view, event) {
        const { state, dispatch } = view;
        const { selection, schema } = state;
        const { $from } = selection;

        // Проверяем, что нажата клавиша пробела
        if (event.key === ' ' && selection.empty) {
          const imiAIType = schema.nodes.imiAI;

          const parent = $from.node($from.depth);
          if (parent.type.name === 'paragraph' && parent.content.size === 0) {
            if (imiAIType) {
              const tr = state.tr.insert($from.before($from.depth), imiAIType.create());
              const newPos = $from.before($from.depth) + 1;
              tr.setSelection(TextSelection.create(tr.doc, newPos));
              dispatch(tr);
              return true;
            }
          }
        }

        return false;
      }
    }
  });
};