import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultProps,
  filterSuggestionItems,
  insertOrUpdateBlock
} from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { createReactBlockSpec, useCreateBlockNote, SuggestionMenuController, DefaultReactSuggestionItem, getDefaultReactSlashMenuItems, SuggestionMenuProps } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";

import "./styles.css";

// The types of alerts that users can choose from
const alertTypes = {
  warning: {
    icon: "⚠️",
    color: "#e69819",
    backgroundColor: "#fff6e6",
  },
  error: {
    icon: "⛔",
    color: "#d80d0d",
    backgroundColor: "#ffe6e6",
  },
  info: {
    icon: "ℹ️",
    color: "#507aff",
    backgroundColor: "#e6ebff",
  },
  success: {
    icon: "✅",
    color: "#0bc10b",
    backgroundColor: "#e6ffe6",
  },
};

export const alertBlock = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "warning",
        values: ["warning", "error", "info", "success"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => (
      <div
        className={"alert"}
        style={{
          backgroundColor: alertTypes[props.block.props.type].backgroundColor,
        }}>
        <select
          contentEditable={false}
          value={props.block.props.type}
          onChange={(event) => {
            props.editor.updateBlock(props.block, {
              type: "alert",
              props: { type: event.target.value as keyof typeof alertTypes },
            });
          }}>
          <option value="warning">{alertTypes["warning"].icon}</option>
          <option value="error">{alertTypes["error"].icon}</option>
          <option value="info">{alertTypes["info"].icon}</option>
          <option value="success">{alertTypes["success"].icon}</option>
        </select>
        <div className={"inline-content"} ref={props.contentRef} />
      </div>
    ),
  }
);

const simpleImageBlock = createReactBlockSpec(
  {
    type: "simpleImage",
    propSchema: {
      src: {
        default:
          "https://www.pulsecarshalton.co.uk/wp-content/uploads/2016/08/jk-placeholder-image.jpg",
      },
    },
    content: "none",
  },
  {
    render: (props) => (
      <img
        className={"simple-image"}
        src={props.block.props.src}
        alt="placeholder"
      />
    ),
  }
);

export const bracketsParagraphBlock = createReactBlockSpec(
  {
    type: "bracketsParagraph",
    content: "inline",
    propSchema: {
      ...defaultProps,
    },
  },
  {
    render: (props) => (
      <div className={"brackets-paragraph"}>
        <div contentEditable={"false"}>{"["}</div>
        <span contentEditable={"false"}>{"{"}</span>
        <div className={"inline-content"} ref={props.contentRef} />
        <span contentEditable={"false"}>{"}"}</span>
        <div contentEditable={"false"}>{"]"}</div>
      </div>
    ),
  }
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    alert: alertBlock,
    simpleImage: simpleImageBlock,
    bracketsParagraph: bracketsParagraphBlock,
  },
});

function CustomSlashMenu(
  props: SuggestionMenuProps<DefaultReactSuggestionItem>
) {
  return (
    <div className={"bn-custom-slash-menu"}>
      {props.items.map((item, index) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, react/jsx-key, jsx-a11y/no-static-element-interactions
        <div
          className={`bn-custom-slash-menu-item ${
            props.selectedIndex === index ? "selected" : ""
          }`}
          onClick={() => {
            props.onItemClick?.(item);
          }}>
            <div className="icon">
              {item.icon}
            </div>
            <div className="title">
              {item.title}
            </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const editor = useCreateBlockNote({
    schema,
    initialContent: [
      {
        type: "alert",
        props: {
          type: "success",
        },
        content: "Alert",
      },
      {
        type: "simpleImage",
        props: {
          src: "https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg",
        },
      },
      {
        type: "bracketsParagraph",
        content: "Brackets Paragraph",
      },
    ],
  });

  const insertImiAI = (editor: typeof schema.BlockNoteEditor) => ({
    title: "simpleImage",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "simpleImage",
      });
    },
    group: "AI",
    icon: <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer md:pl-[2px]"
    >
      <path
        d="M15.4167 6.1665V1.99984M4.58341 16.9998V12.8332M13.3334 4.08317H17.5001M2.50008 14.9165H6.66675M5.41675 1.1665L4.76303 2.47393C4.54179 2.91642 4.43117 3.13766 4.28339 3.32938C4.15225 3.4995 3.99974 3.65201 3.82962 3.78315C3.6379 3.93093 3.41666 4.04155 2.97418 4.26279L1.66675 4.9165L2.97418 5.57022C3.41666 5.79146 3.6379 5.90208 3.82962 6.04986C3.99974 6.181 4.15225 6.33351 4.28339 6.50363C4.43117 6.69535 4.54179 6.91659 4.76303 7.35907L5.41675 8.6665L6.07046 7.35907C6.2917 6.91659 6.40233 6.69535 6.55011 6.50363C6.68124 6.33351 6.83375 6.181 7.00388 6.04986C7.19559 5.90208 7.41684 5.79146 7.85932 5.57022L9.16675 4.9165L7.85932 4.26279C7.41684 4.04155 7.19559 3.93093 7.00388 3.78315C6.83375 3.65201 6.68124 3.4995 6.55011 3.32938C6.40233 3.13766 6.2917 2.91642 6.07046 2.47394L5.41675 1.1665ZM14.1667 9.49984L13.3741 11.085C13.1529 11.5275 13.0423 11.7488 12.8945 11.9405C12.7634 12.1106 12.6109 12.2631 12.4407 12.3943C12.249 12.542 12.0278 12.6527 11.5853 12.8739L10.0001 13.6665L11.5853 14.4591C12.0278 14.6803 12.249 14.791 12.4407 14.9388C12.6109 15.0699 12.7634 15.2224 12.8945 15.3925C13.0423 15.5842 13.1529 15.8055 13.3741 16.248L14.1667 17.8332L14.9594 16.248C15.1806 15.8055 15.2912 15.5842 15.439 15.3925C15.5701 15.2224 15.7226 15.0699 15.8928 14.9388C16.0845 14.791 16.3057 14.6804 16.7482 14.4591L18.3334 13.6665L16.7482 12.8739C16.3057 12.6527 16.0845 12.542 15.8928 12.3943C15.7226 12.2631 15.5701 12.1106 15.439 11.9405C15.2912 11.7488 15.1806 11.5275 14.9594 11.085L14.1667 9.49984Z"
        stroke="#0B3BEC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
  });

  const insertParagraph = (editor: typeof schema.BlockNoteEditor) => ({
    title: "bracketsParagraph",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "bracketsParagraph",
      });
    },
    icon: <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer md:pl-[2px]"
    >
      <path
        d="M15.4167 6.1665V1.99984M4.58341 16.9998V12.8332M13.3334 4.08317H17.5001M2.50008 14.9165H6.66675M5.41675 1.1665L4.76303 2.47393C4.54179 2.91642 4.43117 3.13766 4.28339 3.32938C4.15225 3.4995 3.99974 3.65201 3.82962 3.78315C3.6379 3.93093 3.41666 4.04155 2.97418 4.26279L1.66675 4.9165L2.97418 5.57022C3.41666 5.79146 3.6379 5.90208 3.82962 6.04986C3.99974 6.181 4.15225 6.33351 4.28339 6.50363C4.43117 6.69535 4.54179 6.91659 4.76303 7.35907L5.41675 8.6665L6.07046 7.35907C6.2917 6.91659 6.40233 6.69535 6.55011 6.50363C6.68124 6.33351 6.83375 6.181 7.00388 6.04986C7.19559 5.90208 7.41684 5.79146 7.85932 5.57022L9.16675 4.9165L7.85932 4.26279C7.41684 4.04155 7.19559 3.93093 7.00388 3.78315C6.83375 3.65201 6.68124 3.4995 6.55011 3.32938C6.40233 3.13766 6.2917 2.91642 6.07046 2.47394L5.41675 1.1665ZM14.1667 9.49984L13.3741 11.085C13.1529 11.5275 13.0423 11.7488 12.8945 11.9405C12.7634 12.1106 12.6109 12.2631 12.4407 12.3943C12.249 12.542 12.0278 12.6527 11.5853 12.8739L10.0001 13.6665L11.5853 14.4591C12.0278 14.6803 12.249 14.791 12.4407 14.9388C12.6109 15.0699 12.7634 15.2224 12.8945 15.3925C13.0423 15.5842 13.1529 15.8055 13.3741 16.248L14.1667 17.8332L14.9594 16.248C15.1806 15.8055 15.2912 15.5842 15.439 15.3925C15.5701 15.2224 15.7226 15.0699 15.8928 14.9388C16.0845 14.791 16.3057 14.6804 16.7482 14.4591L18.3334 13.6665L16.7482 12.8739C16.3057 12.6527 16.0845 12.542 15.8928 12.3943C15.7226 12.2631 15.5701 12.1106 15.439 11.9405C15.2912 11.7488 15.1806 11.5275 14.9594 11.085L14.1667 9.49984Z"
        stroke="#0B3BEC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
  });

  const insertAlert = (editor: typeof schema.BlockNoteEditor) => ({
    title: "Alert",
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: "alert",
      });
    },
    aliases: [
      "alert",
      "notification",
      "emphasize",
      "warning",
      "error",
      "info",
      "success",
    ],
    group: "Other",
    icon: <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer md:pl-[2px]"
    >
      <path
        d="M15.4167 6.1665V1.99984M4.58341 16.9998V12.8332M13.3334 4.08317H17.5001M2.50008 14.9165H6.66675M5.41675 1.1665L4.76303 2.47393C4.54179 2.91642 4.43117 3.13766 4.28339 3.32938C4.15225 3.4995 3.99974 3.65201 3.82962 3.78315C3.6379 3.93093 3.41666 4.04155 2.97418 4.26279L1.66675 4.9165L2.97418 5.57022C3.41666 5.79146 3.6379 5.90208 3.82962 6.04986C3.99974 6.181 4.15225 6.33351 4.28339 6.50363C4.43117 6.69535 4.54179 6.91659 4.76303 7.35907L5.41675 8.6665L6.07046 7.35907C6.2917 6.91659 6.40233 6.69535 6.55011 6.50363C6.68124 6.33351 6.83375 6.181 7.00388 6.04986C7.19559 5.90208 7.41684 5.79146 7.85932 5.57022L9.16675 4.9165L7.85932 4.26279C7.41684 4.04155 7.19559 3.93093 7.00388 3.78315C6.83375 3.65201 6.68124 3.4995 6.55011 3.32938C6.40233 3.13766 6.2917 2.91642 6.07046 2.47394L5.41675 1.1665ZM14.1667 9.49984L13.3741 11.085C13.1529 11.5275 13.0423 11.7488 12.8945 11.9405C12.7634 12.1106 12.6109 12.2631 12.4407 12.3943C12.249 12.542 12.0278 12.6527 11.5853 12.8739L10.0001 13.6665L11.5853 14.4591C12.0278 14.6803 12.249 14.791 12.4407 14.9388C12.6109 15.0699 12.7634 15.2224 12.8945 15.3925C13.0423 15.5842 13.1529 15.8055 13.3741 16.248L14.1667 17.8332L14.9594 16.248C15.1806 15.8055 15.2912 15.5842 15.439 15.3925C15.5701 15.2224 15.7226 15.0699 15.8928 14.9388C16.0845 14.791 16.3057 14.6804 16.7482 14.4591L18.3334 13.6665L16.7482 12.8739C16.3057 12.6527 16.0845 12.542 15.8928 12.3943C15.7226 12.2631 15.5701 12.1106 15.439 11.9405C15.2912 11.7488 15.1806 11.5275 14.9594 11.085L14.1667 9.49984Z"
        stroke="#0B3BEC"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>,
  });

  const getCustomSlashMenuItems = (
    editor: typeof schema.BlockNoteEditor
  ): DefaultReactSuggestionItem[] => [
    ...getDefaultReactSlashMenuItems(editor),
    insertImiAI(editor),
    insertParagraph(editor),
    insertAlert(editor),
  ];

  return <BlockNoteView editor={editor}>
    <SuggestionMenuController
        triggerCharacter={"/"}
        suggestionMenuComponent={CustomSlashMenu}
        getItems={async (query) =>
          filterSuggestionItems(getCustomSlashMenuItems(editor), query)
        }
      />
  </BlockNoteView>;
}
