# Reference study: Raleston 3D site

> **Status (2026-10-05):** the "Changes to the brief" section below (voxel R hero, ring portal) belongs to the first, rejected build. The site now follows the Emons-style direction: a white architectural-model campus with one gold accent. See README.md. The effects catalogue is still the reference.

## Sources

| File | What it is |
|---|---|
| `reel-a.mov` | 84 s portrait screen recording of an Instagram Reel, "Websites in 2026". Copied from `~/Downloads/12b0c00f-….mov`. |
| `reel-b.mov` | 17 s portrait screen recording of a second Reel from the same account. Copied from `~/Downloads/3dc8e84d-….mov`. |
| `frames/a/`, `frames/b/` | Frames pulled at 2 fps (a) and 3 fps (b), plus `sheet-NN.jpg` contact sheets with timestamps. |
| `brand/` | Logo, favicon and OG image from the current Framer site. |

ffmpeg isn't installed, so I extracted the frames with a small AVFoundation Swift script.

Reel A contains four sites: an energy drink can, the Emons logistics world, the Oryzo coaster and a short coffee-cup segment. It loops back to the can at about 79 s. Reel B contains the burger and the Ducati.

---

## Effects catalogue

Timestamps are `reel:seconds`.

### 1. Drink can hero (a:0–20, a:79–84)
- **Staging.** It opens on a dark room. A row of black cans floats in an arc, with the hero can lit magenta on a glowing plinth and a soft floor reflection (a:0–1.5).
- **Full-screen colour flip.** On the first scroll the whole page turns saturated magenta. The can fills the frame tilted about 25° and the camera has pushed in close enough to crop it (a:2–4). The flip is a colour wipe, not a fade.
- **Continuous product choreography.** Across the scroll the can rotates, untilts to vertical, then drifts and tilts the other way (a:4–11). Copy blocks change on the left while the can stays pinned and keeps moving, so it is never static.
- **Vignette and radial glow** around the product. The magenta is brightest behind the can and falls off to near black at the edges.
- **Giant type behind the object** (a:13–15): "ZERO BULLSHIT" is set very large and pale behind the can, with a soft smoky texture. The can sits in front of it and the type stays partly readable around it.
- **Variant lineup** (a:15–19): about 12 cans in different colourways stand in a diagonal row receding into depth with strong depth of field. The lineup rotates as you scroll.
- **Change of register** at the FAQ (a:18): the page drops to plain black and white so the copy can be read, then returns to the 3D.

**What to take:** colour flips as structure, tight crops on a hero object, depth of field on rows of repeated objects, and type placed behind objects.

### 2. Emons isometric logistics world (a:22–52)
- **Toy-like but rich.** The world is clean white and grey with one brand red: trucks, rail cranes, containers, a warehouse cut-away full of shelving, ports, planes and an HQ with lit windows. Teal low-poly trees give it scale. It works because of the density of small detail, not polygon count.
- **Each section is a diorama.** The camera holds a three-quarter isometric angle on one scene: warehouse interior (a:24–30), winding road with trucks through hills (a:30–32), port with cranes, ships and planes (a:33–39), rail yard (a:40–46), HQ campus (a:47–51).
- **Transitions fly through clouds.** Between dioramas the camera lifts into a volumetric cloud layer, the frame whites out and blurs, then it descends on the next scene (a:39.5, a:47). This hides the cut and reads as travel. It is the strongest transition in either reel.
- **Directional motion blur** on vehicles and on the camera during fast moves (a:43–46).
- **Hero vehicle close-up** (a:51–52): the camera ends tight on a red truck, so the story moves from map scale to object scale.
- **DOM overlay:** a small glass card bottom-left and a progress dot-row at the bottom. The 3D gets about 85% of the screen.

**What to take:** small worlds packed with detail, travel between scenes through atmosphere (clouds or volumetrics), and ending big scenes on a close-up of a hero object.

### 3. Oryzo coaster (a:53–76)
- **Product as a planet.** A circular coaster is lit like an eclipse on black, with the rim catching orange light (a:53–55).
- **Object passing through a giant word** (a:57–59): "it's wearable" is set across the full width and the object flies through the word, splitting "w" from "arable". Red shards and debris trail behind it. This is depth-sorted type and object, not a 2D overlay.
- **Hard cut to editorial photography:** a red full-bleed close-up, then the word "RISE" over a still life.
- **Thermal false-colour view** (a:66–67): the cup renders in a heat palette (black, purple, magenta, orange, yellow) with a label "THERMODYNAMIC STABILITY" and a formula. It is a scientific view mode that turns the product into data.
- **Macro material close-ups** (a:73–76): the camera goes so close to the cork texture it becomes terrain, then "sustainability" is set huge, first masked by the texture, then on a light page.

**What to take:** objects that physically break through words, a scientific "view mode" as storytelling (thermal or x-ray), and macro shots where the material becomes the backdrop.

### 4. Burger (b:1–5, b:13–17)
- **Exploded layers.** The burger hangs as separate floating layers (bun, patties, cheese, sauce), lit warm and cinematic. Scroll compresses the stack and the bites appear in sequence.
- **Assembly, then packaging.** The burger, fries and a shake drop into a branded box. The lid closes and the box becomes the branded hero shot (b:2.3–5).
- **Kinetic labels** ("SMASHED TO ORDER", "THE STACK", "THE LINEUP", "OVERTIME SHAKES") slide in at the same depth as the food. Some are partly hidden behind the object.

**What to take:** explode, then reassemble, then contain. Parts separate to explain themselves, then come back together into something finished.

### 5. Ducati (b:5–13)
- **Studio hero** on black with a floor reflection (b:5–6).
- **Camera flies into details.** The camera moves from three-quarter view into the fairing, fork and brake disc, filling the frame with the curve of the bodywork (b:6.7–8.7). Callout text appears beside each detail ("World-first: carbon fibre front fork").
- **Speed lines.** Red light streaks wrap around the bike, following its silhouette, like an aerodynamics flow visualisation (b:9.3–9.7).
- **X-ray** (b:10–11): the bike turns into a white additive wireframe or ghost on black, showing engine internals through the translucent shell. The transition sweeps rather than fading uniformly.
- **Bare chassis** (b:11–12): the bike is stripped to grey unpainted parts, then the paint returns as the camera pulls back to the full studio shot (b:12–13).

**What to take:** camera moves into details with callouts, flow-line visualisation, x-ray followed by stripped and then rebuilt, and finishing on the full-object hero.

### Shared qualities across all sites
1. **One object, many states.** Each site picks one hero object and keeps changing its state (colour, pose, material, explosion, view mode) rather than swapping objects.
2. **Colour is architecture.** Section changes are full-screen colour or light changes (black to magenta, dark to white, black to thermal), not small accents.
3. **Depth layering.** Type sits behind objects, objects pass through type, and foreground depth of field frames the subject.
4. **The camera always moves.** Even at rest there is drift, sway or rotation. No frame is static.
5. **Material and lighting do the work.** Rim light, soft reflections, glowing plinths and real PBR. Nothing is flat-shaded.
6. **The DOM stays quiet.** Small copy blocks and thin UI, while the 3D gets the screen.

---

## How Raleston matches this level

| Reference quality | Raleston implementation |
|---|---|
| One object, many states | The Raleston **R mark** (the folded-ribbon logo) is the thread through the page. It forms in the hero, its ring becomes the CTA portal, and the R reappears in scene transitions. |
| Full-screen colour flips | Each scene has a mood. Background, fog, tone-map exposure, bloom tint and DOM colours all tween together through one `mood` uniform set. |
| Objects through type | Troika `<Text>` placed in 3D with `depthTest` on. Shards and blocks fly through "NO MORE SILOS" and the "40%" numerals. A custom `onBeforeCompile` dissolves glyphs where objects pass through them. |
| Cloud fly-through travel | A volumetric cloud layer (raymarched noise on a full-screen pass, or stacked soft sprites on the low tier) is used for the ticket journey → planet transition. The camera rises out of the rooms into the clouds and breaks out above the planet. |
| Detail fly-ins with callouts | Scene 3: the camera dollies module to module. The DOM leader lines are projected from 3D anchor points every frame. |
| X-ray / thermal view mode | Scene 3 scan plane. Above it is solid PBR. Below it is a fresnel wireframe plus a **thermal false-colour** pass that shows "load" in the circuitry (palette from Oryzo a:66). It uses a shared clip-plane uniform, not opacity. |
| Speed lines (Ducati) | Scene 2: shards become flow lines along curl-noise splines into the lattice. Scene 6 reuses the same line shader for the warp tunnel. |
| Explode, then reassemble (burger) | Scene 3 explodes the platform core, then puts it back together, locked and glowing, at the end of the section, so there is closure. |
| Detail-dense small worlds (Emons) | Scene 5 planet. Detail comes from instanced props (windows, cars, trees, turbines) and shader detail (window grids, roof seams), not heavy meshes. |
| Living camera | A global "handheld" layer adds low-frequency noise to camera position and rotation on top of every scripted move, scaled down for reduced motion. |

---

## Changes to the brief, and why

1. **Hero structure becomes the Raleston R mark, not a generic monolith or crown.**
   The current logo is a folded ribbon forming an "R" with a ring at its foot. It is distinctive, extrudes well and is already the brand. Building it from 20–60k glass and chrome micro-blocks gives a reveal that "scattered systems become a digital empire" and that means something specific to Raleston. A generic crystal tower could belong to any company. The blocks lock onto a voxelised version of the ribbon's bevelled extrusion, then the solid gold ribbon mesh fades in under them so the final mark reads cleanly.

2. **CTA portal is the logo's ring.**
   The ring at the foot of the R detaches during the hero peel-away. The viewer last sees it as a small gold torus, and it returns at the end as the luminous gateway. This bookends the page.

3. **The x-ray adds a thermal false-colour layer below the scan plane**, on top of the fresnel wireframe the brief asks for. The Oryzo thermal view was the most memorable view mode in either reel. Heat on the circuitry tells a story ("this is where the platform works hard"), where a plain wireframe only looks technical.

4. **Ticket journey → planet uses a cloud fly-through**, taken from Emons a:39 and a:47. That makes it the one scene change that travels through atmosphere, and it bridges the indoor rooms to the outdoor planet.

All seven scenes from the brief stay. Nothing is cut.

---

## Notes for production
- Blender isn't installed. All models will be procedural TypeScript (bevelled `ExtrudeGeometry`, rounded boxes, merged geometry, instancing), written as generators in `scripts/` that export compressed GLBs with gltf-transform. Installing Blender would only help with baked AO and could be added later.
- Voronoi fracture for scene 2 will be precomputed at build time in a Node script (3D Voronoi cells clipped to the tower hull) and exported as GLB, so phones never fracture anything at runtime.
- `references/*.mov` is 72 MB. Keep `references/` out of git and out of the build.
