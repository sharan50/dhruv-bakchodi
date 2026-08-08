Self-contained HTML things. Nothing here needs a build step or a package manager —
every page opens straight from disk and deploys as static files.

| Path | What it is |
|---|---|
| [`index.html`](index.html) | **FALL LINE** — an endless procedural alpine descent (below) |
| [`reports/zen-technologies/`](reports/zen-technologies/) | **Zen Technologies** — business deep dive report with inline SVG charts |

Deployed as-is via `netlify.toml`: `/` is the game, `/reports/<name>/` is each report.

---

# FALL LINE

An endless procedural alpine descent that runs in a single HTML file. No build step,
no dependencies, no assets — the terrain, the artwork, the physics and the music are
all generated at runtime.

Open `index.html` in a browser. Press <kbd>SPACE</kbd> to drop in.

---

## Controls

| Input | Effect |
|---|---|
| <kbd>←</kbd> <kbd>→</kbd> (or <kbd>A</kbd> <kbd>D</kbd>) | Steer. Hold longer to bring the skis further across the fall line. |
| *(nothing pressed)* | Standing tall, skis flat. Barely any edge, barely a turn, and a lot of drag. |
| <kbd>Q</kbd> | Knees a little bent. Casual — modest edge, gentle turns. |
| <kbd>Q</kbd>+<kbd>W</kbd> | Real edge grip. Hold a direction long enough and you come parallel and stop. |
| <kbd>Q</kbd>+<kbd>W</kbd>+<kbd>E</kbd> | Everything you've got. Instant edge set, sharp turn, hard scrub. |
| <kbd>Q</kbd>+<kbd>W</kbd>+<kbd>E</kbd> *with no steering* | Full racing tuck. Drag collapses and the speed goes silly. |
| <kbd>SPACE</kbd> | Pop / unweight the skis. More effort = more pop. |
| <kbd>P</kbd> / <kbd>Esc</kbd> · <kbd>R</kbd> · <kbd>M</kbd> | Pause · restart · mute |

The effort keys are the whole game. Speed you can't hold, rough snow and washed-out
edges eat your **balance**; bending the knees buys it back. Run out of balance and you
ragdoll down the hill, which ends the run.

Measured effort ladder, entering a turn at ~22 km/h and holding the arrow down:

| Effort | Max edge angle | Comes parallel | Stops |
|---|---|---|---|
| none | 7° | ~5 s | never (drifts to ~18 km/h) |
| <kbd>Q</kbd> | 27° | ~2.5 s | ~4 s |
| <kbd>Q</kbd><kbd>W</kbd> | 48° | ~1.0 s | ~1.7 s |
| <kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd> | 66° | ~0.5 s | ~0.8 s |

## The mountain

Endless and procedurally generated ahead of you, in sections of 360–620 m. Difficulty
ramps as you descend, with the occasional easier run thrown in as a breather. Each
section gets a gate banner across the piste, a pair of trailside signs, a name and a
number, in the European grading system:

| | pitch | narrowest | widest |
|---|---|---|---|
| **GREEN** | 9–13° | 27 m | 57 m |
| **BLUE** | 14–19° | 21 m | 45 m |
| **RED** | 21–27° | 15 m | 34 m |
| **BLACK** | 29–36° | 12 m | 27 m |
| **DOUBLE BLACK** | 37–45° | 10 m | 23 m |

**The trail actually goes somewhere.** The centreline snakes across five scales at
once — broad traverses across the face down to turns you take every few seconds —
peaking at 40° off the fall line and averaging 12°. On top of that the corridor
pinches and opens, so a black can choke to 12 m and then release into a bowl. The
piste banks into its own turns, outside edge riding higher.

The upshot is that you cannot straight-line it. A full tuck with no steering runs
about 470–550 m, roughly 30 seconds, before it puts you into the trees or buries the
tips in deep snow. A skilled line covering the same ground goes indefinitely — the
tracked test run did 2,465 m and 636 m of vertical in five and a half minutes and was
still descending.

Steeper sections are narrower, more heavily gladed and more likely to be a mogul
field. Along the way: moguls, rollers and kickers you can launch off, orange piste
markers, B-net on the steeps, snow guns, hay-bale padding, a running chairlift, and
trees that will absolutely end your run. The strip on the right edge of the HUD shows
what's coming.

## Two surfaces

You should never be in doubt about whether you're on the trail.

**Groomed piste** carries real corduroy — the fine grooves a snowcat tiller leaves.
They're drawn as actual lines that follow the piste centreline and lie on the terrain,
so they converge to the vanishing point and bend with the trail the way machine tracks
do. Spacing is a power-of-two mip off a fixed 14 cm lattice, so a groove visible in a
far band is still there in the near band and nothing swims as you move. They're drawn
per depth slab, interleaved with the terrain rows, so a roller in front correctly hides
the grooves behind it. Your own tracks cut through them. A mogul field is, by
definition, not groomed, so the corduroy fades out there.

This deliberately isn't done as vertex shading. Grooves are ~10 cm apart and no sample
grid resolves that — shading it as a ripple only ever read as vague fabric banding.

**Off piste** is naturally stacked snow: wind drifts at two scales, a duller and deeper
tone than a tilled surface, crystalline sparkle up close, and no grooves anywhere. The
cut edge between the two reads as a faint seam.

The drift mottling is deliberately *shading* rather than relief. Real relief at that
scale out-runs the fall line and creates uphill pockets you can't roll out of — and
unlike geometry, shading survives the distance low-pass that smooths normals away, so
it still reads at 60 m.

## How it works

Everything is one file, ~2,300 lines.

**Terrain** is a height field `H(x, z)` composed of a piecewise-integrated elevation
profile (pitch varies per section, smoothly blended across joins), a meandering piste
centreline, banks that rise outside the markers, fall-line rollers, a rotated hex
lattice of moguls masked to the piste, fbm surface texture, and discrete kickers.
Everything that depends only on `z` is cached, because the renderer walks the sample
grid row by row.

**Rendering** is canvas 2D — no WebGL. The sample grid is aligned to the camera and
spaced harmonically in `1/depth`, so every row is the same height on screen. Objects,
particles, the skier and the carve tracks are all painted interleaved with the terrain
rows in camera-depth order, which is the whole depth-sorting scheme. Normals are
sampled over roughly one grid cell so distant detail low-passes away instead of
aliasing into shimmer. Tessellation auto-scales to hold frame rate.

The camera does not guess its pitch — it *solves* for the angle that puts the skier at
a fixed height on screen, which is what makes a 9° green and a 45° couloir both frame
correctly.

**Physics** runs at a fixed 180 Hz. Gravity is resolved into the slope plane; the skis
have a heading, an edge angle, and a sidecut radius, and the turn comes from carving
(`R = R_sidecut · cos φ`) plus skidded pivot. Lateral velocity is resisted up to the
grip the edges will actually hold — past that they wash out. Speed is controlled the
way it is in reality: an edged ski held across the fall line ploughs snow, so **turn
shape is the brake**. Air drag uses a real `½ρ·C_d A·v²` with a frontal area that
collapses in a tuck. Landings are absorbed by however bent your knees were.

**Audio** is a Web Audio synth with no samples. A 16th-note scheduler drives pad, sub,
bass, hats, kick, clap, a delayed arpeggio and a lead, and layers gate in by speed —
cruising is sparse, full send is the whole arrangement. Tempo runs 84→154 BPM with
your speed, and the key changes with the difficulty of the piste (major on the greens,
minor on the reds and blacks, phrygian on the double blacks). Wind, edge hiss and ski
chatter are live-filtered noise driven by speed, edge angle and terrain roughness.

## Notes

Tested in Chromium. Sound needs one key press or click to start, which the browser
requires. Headphones recommended.
