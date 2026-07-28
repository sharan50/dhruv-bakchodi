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

**GREEN** 9–13° · **BLUE** 14–19° · **RED** 21–27° · **BLACK** 29–36° · **DOUBLE BLACK** 37–45°

Steeper sections are narrower, more heavily gladed, more likely to be a mogul field,
and get rowdier terrain. Along the way: groomed corduroy, moguls, rollers and kickers
you can launch off, orange piste markers, B-net on the steeps, snow guns, hay-bale
padding, a running chairlift, and trees that will absolutely end your run.

A 6½-minute autopiloted test run covered 3,198 m and 908 m of vertical without
reaching the end, because there isn't one. The strip on the right edge of the HUD
shows what's coming.

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
