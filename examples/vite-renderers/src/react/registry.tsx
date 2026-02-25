import type { Components } from "@json-render/react";
import type { AppCatalog } from "./catalog";
import {
  stackStyle,
  cardStyle,
  cardTitleStyle,
  cardSubtitleStyle,
  textStyle,
  buttonStyle,
  badgeStyle,
  listItemStyle,
  listItemCheckStyle,
  listItemTextStyle,
  rendererBadgeStyle,
  rendererDotStyle,
  rendererLabel,
  rendererTabsWrapperStyle,
  rendererTabsLabelStyle,
  rendererTabsStyle,
  rendererTabStyle,
} from "../shared/styles";

export const components: Components<AppCatalog> = {
  Stack: ({ props, children }) => (
    <div
      style={
        stackStyle(
          props.direction === "horizontal",
          props.gap,
          props.padding,
          props.align,
        ) as React.CSSProperties
      }
    >
      {children}
    </div>
  ),

  Card: ({ props, children }) => (
    <div style={cardStyle as React.CSSProperties}>
      {props.title && (
        <div style={{ marginBottom: "4px" }}>
          <h2 style={cardTitleStyle as React.CSSProperties}>{props.title}</h2>
        </div>
      )}
      {props.subtitle && (
        <p style={cardSubtitleStyle as React.CSSProperties}>{props.subtitle}</p>
      )}
      {children}
    </div>
  ),

  Text: ({ props }) => (
    <span
      style={
        textStyle(props.size, props.weight, props.color) as React.CSSProperties
      }
    >
      {String(props.content ?? "")}
    </span>
  ),

  Button: ({ props, emit }) => (
    <button
      disabled={props.disabled}
      onClick={() => emit("press")}
      style={buttonStyle(props.variant, props.disabled) as React.CSSProperties}
    >
      {props.label}
    </button>
  ),

  Badge: ({ props }) => (
    <span style={badgeStyle(props.color) as React.CSSProperties}>
      {props.label}
    </span>
  ),

  ListItem: ({ props, emit }) => (
    <div
      onClick={() => emit("press")}
      style={listItemStyle(props.completed) as React.CSSProperties}
    >
      <div style={listItemCheckStyle(props.completed) as React.CSSProperties}>
        {props.completed ? "✓" : ""}
      </div>
      <span style={listItemTextStyle(props.completed) as React.CSSProperties}>
        {props.title}
      </span>
    </div>
  ),

  RendererBadge: ({ props }) => (
    <span style={rendererBadgeStyle(props.renderer) as React.CSSProperties}>
      <span style={rendererDotStyle(props.renderer) as React.CSSProperties} />
      {rendererLabel(props.renderer)}
    </span>
  ),

  RendererTabs: ({ props, emit }) => (
    <div style={rendererTabsWrapperStyle as React.CSSProperties}>
      <span style={rendererTabsLabelStyle as React.CSSProperties}>Render</span>
      <div style={rendererTabsStyle as React.CSSProperties}>
        <button
          onClick={() => emit("pressVue")}
          style={
            rendererTabStyle(
              props.renderer === "vue",
              true,
              props.renderer,
            ) as React.CSSProperties
          }
        >
          Vue
        </button>
        <button
          onClick={() => emit("pressReact")}
          style={
            rendererTabStyle(
              props.renderer === "react",
              false,
              props.renderer,
            ) as React.CSSProperties
          }
        >
          React
        </button>
      </div>
    </div>
  ),
};
