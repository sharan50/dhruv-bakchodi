# Zen Technologies — Business Deep Dive

A standalone HTML research report on Zen Technologies Ltd: business model, segments,
history, the 2024–25 acquisition campaign, leadership, financials, order book,
competition, risks and strategy — with hand-rolled inline SVG charts.

Open `index.html` in a browser. No build step, no dependencies, no network calls —
it works over `file://` and as a static deploy alike.

## Layout

| File | What's in it |
|---|---|
| `index.html` | Document structure only — sidebar nav, the numbered sections and their prose |
| `assets/report.css` | All styling, including the light/dark theme tokens on `:root` / `:root[data-theme="dark"]` |
| `assets/report.js` | Theme toggle, chart tooltips, the SVG chart builders and the scroll-spy nav |

Originally authored as a single self-contained `index.html`; the CSS and JS were
lifted out unchanged so each part is editable on its own.

## Charts

Every chart is built at runtime into a `<div id="chart-*">` placeholder by
`assets/report.js` using `document.createElementNS` — no charting library. Each
series is coloured from the `--series-*` CSS variables so charts follow the theme,
and each mark is bound to a cursor-following tooltip via `bindTip`.

| Placeholder | Chart |
|---|---|
| `chart-bom` | Bill-of-materials vs. software share of product cost |
| `chart-rev` | Revenue history |
| `chart-margin` | Margin trend |
| `chart-roce` | ROCE |
| `chart-wc` | Working capital |
| `chart-amcbase`, `chart-amcproj` | Installed AMC base and projection |
| `chart-ob` | Order book |

## Editing

- **Prose or a new section** — edit `index.html`, and add a matching entry to the
  `<nav class="nav">` list in the sidebar so the scroll-spy picks it up.
- **Colours, spacing, theme** — `assets/report.css`. Change a token in both the
  `:root` and `:root[data-theme="dark"]` blocks so light and dark stay in step.
- **Chart data** — the numbers live inside each chart's IIFE in `assets/report.js`,
  next to the labels and tooltip notes they belong to.
