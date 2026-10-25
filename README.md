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
| `game.js` | The story: the lab, the hits on the tube, the escape, and "A few years later...". |
| `assets/` | The PNG pictures. |
| `sounds/` | The sound effects. Each of Arkey's three hits plays its own sound: `test-tube-hit.mp3`, `test-tube-hit-2.mp3` and `test-tube-hit-3.mp3`. The shatter (`shatter.mp3`) starts 0.3 seconds before the tube breaks, and the splash (`splash.mp3`) starts 0.3 seconds before Doodle lands. |

## Opening story, in order

1. A dark, inky-blue lab with a glowing test tube. Doodle is trapped inside, with his eyes closed.
2. Arkey bounces in from the right with his flashlight, facing left, and stops next to the tube.
3. He swings three times. The tube shakes after each hit and changes from `test-tube.png` to `test-tube-cracked-1.png`, `-2.png` and `-3.png`. Doodle stays asleep.
4. The tube shatters (`test-tube-broken.png`). Doodle flies out to the left and falls, sinks a little below the floor, and pops back up. Arkey hops down to the ground.
5. Doodle gets up with a little hop, opens his eyes, and is surprised for a moment. They run off to the right, leaping as they go. Doodle mostly runs in his side picture, with his front view flashing in now and then, at random.
6. The screen fades to black and shows "A few years later..." for a few seconds.
7. Times Square (`scene-2-background.png`) fades in. The story stops here for now.

## Pictures

| File | Used for |
| --- | --- |
| `doodle-and-arky-journey.png` | Title screen background |
| `test-tube.png` | The intact tube, with Doodle inside |
| `test-tube-cracked-1.png`, `-2.png`, `-3.png` | Transparent crack overlays on top of the tube and in front of Doodle. Each hit replaces the last one: `-1` after the first hit, `-2` after the second, `-3` after the third. |
| `doodle-without-accessories-eyes-closed.png` | Doodle asleep, in the tube and lying on the ground until he gets up |
| `doodle-without-accessories.png` | Doodle awake, getting up and walking out (his front view, flashing in now and then during the walk) |
| `doodle-without-accessories-surprised.png` | Doodle's surprised face, shown once as he wakes up |
| `arkey-moving-with-flashlight.png` | Arkey in the opening (flipped when facing left) |
| `test-tube-broken.png` | The shattered tube |
| `doodle-falling.png` | Doodle falling out of the tube |
| `doodle-moving-without-accessories.png` | Doodle walking right (flipped when walking left) |
| `scene-2-background.png` | Times Square background |

## Changing the story timing

The numbers at the top of `game.js` (walk speed, hit timing, fade and text timing) can be changed to make the story faster or slower.
