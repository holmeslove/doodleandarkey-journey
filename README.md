# Doodle and Arkey's Journey

A 2D story game made with plain HTML, CSS and JavaScript. Doodle, a blue blowfish gamer, wakes up in a secret lab with his best friend Arkey, a yellow shark.

## How to play

1. Open `index.html` in a web browser. The game fits the window and keeps its shape when you resize it.
2. On the title screen, click **Play** or press **Space** (or **Enter**).
3. Watch the opening story. The sequence runs by itself for now.

## Title screen settings

| Setting | What it does |
| --- | --- |
| Music volume | 0 to 10. Saved in the browser. Music isn't added yet. |
| Sound effects volume | 0 to 10. Saved in the browser. Sound effects aren't added yet. |
| Background darkness | Darkens the story backgrounds. Saved in the browser. |

## Files

| File | What it does |
| --- | --- |
| `index.html` | The page. Holds the canvas and the title screen. |
| `style.css` | How the page and the title screen look. |
| `game.js` | The story: the lab, the smash, the escape, and "A few years later...". |
| `assets/` | The PNG pictures. |

## Opening story, in order

1. A dark, inky-blue lab with a glowing test tube holding Doodle.
2. Arkey walks in from the right with his flashlight, facing left.
3. When he gets close, the smash picture (`arkey-freeing-doodle.png`) fills the screen.
4. Doodle falls out (`doodle-falling.png`), the tube is empty (`test-tube-broken.png`), and Arkey hops down to the ground.
5. Doodle changes to his picture without accessories, and they walk off to the right.
6. The screen fades to black and shows "A few years later..." for a few seconds.
7. Times Square (`scene-2-background.png`) fades in. The story stops here for now.

## Pictures

| File | Used for |
| --- | --- |
| `doodle-and-arky-journey.png` | Title screen background |
| `doodle-in-test-tube.png` | Doodle in the test tube. **Not in the assets folder yet.** A placeholder is drawn until it is added. |
| `arkey-moving-with-flashlight.png` | Arkey in the opening (flipped when facing left) |
| `arkey-freeing-doodle.png` | The smash picture |
| `doodle-falling.png` | Doodle falling out of the tube |
| `test-tube-broken.png` | The empty, broken tube |
| `doodle-without-accessories.png` | Doodle standing |
| `doodle-moving-without-accessories.png` | Doodle walking right (flipped when walking left) |
| `scene-2-background.png` | Times Square background |

## Changing the story timing

The numbers at the top of `game.js` (walk speed, smash length, fade and text timing) can be changed to make the story faster or slower.
