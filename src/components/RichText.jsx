// Walks Tina's rich-text JSON tree and renders styled JSX that matches
// the original ReadingOverlay typography.
import { Fragment } from "react";
import linkifyTwyn from "../utils/linkifyTwyn.jsx";

function renderInline(node, key) {
  if (!node) return null;

  if (node.type === "text") {
    let el = linkifyTwyn(node.text);
    if (node.bold) el = <strong key={key} style={{ fontWeight: 600 }}>{el}</strong>;
    if (node.italic) el = <em key={key} style={{ fontStyle: "italic" }}>{el}</em>;
    if (node.code)
      el = (
        <code
          key={key}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.92em",
            padding: "0 4px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 2,
          }}
        >
          {el}
        </code>
      );
    return <Fragment key={key}>{el}</Fragment>;
  }

  if (node.type === "a") {
    return (
      <a
        key={key}
        href={node.url}
        target="_blank"
        rel="noreferrer"
        style={{
          color: "var(--accent)",
          borderBottom: "1px solid var(--accent-line)",
        }}
      >
        {renderChildren(node.children)}
      </a>
    );
  }

  // unknown inline → render children if any, else fall back to text
  if (Array.isArray(node.children)) return renderChildren(node.children);
  return null;
}

function renderChildren(children = []) {
  return children.map((c, i) =>
    isBlock(c.type) ? renderBlock(c, i) : renderInline(c, i)
  );
}

function isBlock(type) {
  return [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "lic",
    "blockquote",
    "hr",
    "img",
    "code_block",
  ].includes(type);
}

function renderBlock(node, key) {
  switch (node.type) {
    case "h1":
    case "h2":
      return (
        <h2
          key={key}
          style={{
            margin: "22px 0 0",
            fontSize: 26,
            fontWeight: 500,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            color: "var(--text)",
          }}
        >
          {renderChildren(node.children)}
        </h2>
      );
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return (
        <h3
          key={key}
          style={{
            margin: "18px 0 0",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            color: "var(--text)",
          }}
        >
          {renderChildren(node.children)}
        </h3>
      );
    case "p":
      return (
        <p
          key={key}
          style={{
            margin: 0,
            fontSize: 18,
            lineHeight: 1.62,
            color: "var(--text)",
            textWrap: "pretty",
          }}
        >
          {renderChildren(node.children)}
        </p>
      );
    case "ul":
      return (
        <ul
          key={key}
          style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 10 }}
        >
          {renderChildren(node.children)}
        </ul>
      );
    case "ol":
      return (
        <ol
          key={key}
          style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 10 }}
        >
          {renderChildren(node.children)}
        </ol>
      );
    case "li":
      return (
        <li
          key={key}
          style={{
            fontSize: 17,
            lineHeight: 1.55,
            color: "var(--text-2)",
          }}
        >
          {renderChildren(node.children)}
        </li>
      );
    case "lic":
      return <Fragment key={key}>{renderChildren(node.children)}</Fragment>;
    case "blockquote":
      return (
        <blockquote
          key={key}
          style={{
            margin: "12px 0",
            padding: "22px 28px",
            borderLeft: "2px solid var(--accent)",
            background: "var(--bg-2)",
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 24,
            lineHeight: 1.3,
            color: "var(--text)",
            letterSpacing: "-0.005em",
            textWrap: "balance",
          }}
        >
          {renderChildren(node.children)}
        </blockquote>
      );
    case "hr":
      return (
        <hr
          key={key}
          style={{
            border: 0,
            borderTop: "1px solid var(--border)",
            margin: "12px 0",
          }}
        />
      );
    case "img":
      return (
        <img
          key={key}
          src={node.url}
          alt={node.alt || ""}
          style={{
            maxWidth: "100%",
            display: "block",
            border: "1px solid var(--border)",
          }}
        />
      );
    case "code_block":
      return (
        <pre
          key={key}
          style={{
            margin: 0,
            padding: "16px 20px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: 2,
            fontFamily: "var(--font-mono)",
            fontSize: 13.5,
            lineHeight: 1.55,
            overflowX: "auto",
            color: "var(--text-2)",
          }}
        >
          <code>{(node.value ?? "").toString()}</code>
        </pre>
      );
    default:
      return null;
  }
}

export default function RichText({ content }) {
  if (!content) return null;
  // Tina rich-text shape is { type: "root", children: [...] }
  const children = Array.isArray(content)
    ? content
    : content.children || [];
  return (
    <div style={{ display: "grid", gap: 22 }}>
      {children.map((node, i) => renderBlock(node, i))}
    </div>
  );
}
