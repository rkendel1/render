import { h } from "vue";
import type { Components } from "@json-render/vue";
import type { AppCatalog } from "./catalog";
import {
  stackStyle,
  cardStyle,
  cardTitleStyle,
  cardSubtitleStyle,
  textStyle,
  textSizeMap,
  textWeightMap,
  buttonStyle,
  badgeStyle,
  listItemStyle,
  listItemCheckStyle,
  listItemTextStyle,
  rendererBadgeStyle,
  rendererDotStyle,
  rendererColor,
  rendererLabel,
  rendererTabsWrapperStyle,
  rendererTabsLabelStyle,
  rendererTabsStyle,
  rendererTabStyle,
} from "../shared/styles";

export const components: Components<AppCatalog> = {
  Stack: ({ props, children }) =>
    h(
      "div",
      {
        style: stackStyle(
          props.direction === "horizontal",
          props.gap,
          props.padding,
          props.align,
        ),
      },
      children,
    ),

  Card: ({ props, children }) =>
    h("div", { style: cardStyle }, [
      props.title &&
        h("div", { style: { marginBottom: "4px" } }, [
          h("h2", { style: cardTitleStyle }, props.title),
        ]),
      props.subtitle && h("p", { style: cardSubtitleStyle }, props.subtitle),
      children,
    ]),

  Text: ({ props }) =>
    h(
      "span",
      { style: textStyle(props.size, props.weight, props.color) },
      String(props.content ?? ""),
    ),

  Button: ({ props, emit }) =>
    h(
      "button",
      {
        disabled: props.disabled,
        onClick: () => emit("press"),
        style: buttonStyle(props.variant, props.disabled),
      },
      props.label,
    ),

  Badge: ({ props }) =>
    h("span", { style: badgeStyle(props.color) }, props.label),

  ListItem: ({ props, emit }) =>
    h(
      "div",
      { onClick: () => emit("press"), style: listItemStyle(props.completed) },
      [
        h(
          "div",
          { style: listItemCheckStyle(props.completed) },
          props.completed ? "✓" : "",
        ),
        h("span", { style: listItemTextStyle(props.completed) }, props.title),
      ],
    ),

  RendererBadge: ({ props }) =>
    h("span", { style: rendererBadgeStyle(props.renderer) }, [
      h("span", { style: rendererDotStyle(props.renderer) }),
      rendererLabel(props.renderer),
    ]),

  RendererTabs: ({ props, emit }) =>
    h("div", { style: rendererTabsWrapperStyle }, [
      h("span", { style: rendererTabsLabelStyle }, "Render"),
      h("div", { style: rendererTabsStyle }, [
        h(
          "button",
          {
            onClick: () => emit("pressVue"),
            style: rendererTabStyle(
              props.renderer === "vue",
              true,
              props.renderer,
            ),
          },
          "Vue",
        ),
        h(
          "button",
          {
            onClick: () => emit("pressReact"),
            style: rendererTabStyle(
              props.renderer === "react",
              false,
              props.renderer,
            ),
          },
          "React",
        ),
      ]),
    ]),
};
