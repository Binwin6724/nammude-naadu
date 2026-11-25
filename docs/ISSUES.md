# Nammude Naadu: issue tracker

Review date: 24 November 2026. Scope: Prologue to Chapter 5.

## How it was tested

- **Player bot** (`tools/qa-bot.js`): plays the real game with real key presses (walks with path-finding, presses E, holds E, crafts, rides, plays the mini-games) on a sped-up clock. It logs stuck spots, missing markers or prompts, speakers who are absent or off-screen, overlapping or off-screen UI, text shown too briefly, and every console error.
- **Screenshots** of every area, plus phone portrait and landscape.
- **Audio** measured at the mixer output while playing.
- **Load tests**: every checkpoint loaded and played on from; 24 page loads in a row.

To run the bot: copy `tools/qa-bot.js` to `game/_qa.js`, open the game, load `_qa.js` as a script, then call `QA.start(0, 10)` and later `QA.report()`.

**Severity:** Blocker = cannot continue. High = breaks immersion or loses progress. Medium = clearly noticeable. Low = polish.
**Status:** Verified = fixed and re-tested in play. Checked = fixed and checked directly (screenshot, measurement or code path). Open = not fixed.

## Issues

| # | Area | Where | Severity | What happened | Root cause | Fix | Status |
|---|---|---|---|---|---|---|---|
| 1 | Progression | Chapter 1 after replaying Chapter 5 | Blocker | Jomon is not at the bus stop, so the story cannot start | Characters and furniture never went back to their starting places between chapters | Every object's home position is remembered and restored on reset | Verified |
| 2 | Performance | Anywhere | Blocker | Minimising the window (zero size) stopped the game for good | One drawing error ended the frame loop | Frame loop survives errors; zero-size canvases guarded | Verified |
| 3 | Loading | Title screen | Blocker | Title with no buttons if one file failed to load ([before](screenshots/before-dead-title.jpg)) | No error handling; local server dropped connections | "Loading…" state, automatic retry, "Try again" button; server queue raised to 128 | Checked (24/24 loads) |
| 4 | Story | Quit to title | High | The chapter carried on invisibly behind the title, and two chapters could run at once | Story timers and key listeners outlived the chapter | Every chapter run has an id; timers, dialogue and movement from an old run die | Verified (0 events after quitting and mashing E) |
| 5 | Saving | All chapters | High | Quitting lost up to an hour | Saved only at chapter start | Two checkpoints in each of Chapters 1 to 5 | Verified (10/10 restored) |
| 6 | Saving | Second checkpoint | High | Loading it restored the wrong state ("day 0") | Passing checkpoint 1 overwrote the save | Passed checkpoints are skipped | Verified |
| 7 | Controls | Cutscenes and dialogue | High | Could not pause; Esc did nothing | Pause allowed only while walking | Real pause everywhere: story, voices and movement freeze | Verified |
| 8 | Controls | Title cards | High | Crafting and pause opened over chapter cards | Cards did not lock the game | Cards lock input | Verified |
| 9 | Controls | Fishing, football | High | Esc to leave also opened the pause menu ([before](screenshots/before-esc-pause.jpg)) | One key press reached both handlers | The key that closes a window goes no further | Checked |
| 10 | Controls | Alt-tab | Medium | Arjun kept walking | Keys never released on focus loss | Keys cleared on blur | Checked |
| 11 | Controls | Malayalam keyboard layout | Medium | WASD and E did nothing | Keys read by character | Keys read by physical position | Checked |
| 12 | Controls | Hold actions | Low | Enter started an action but could not hold it | Enter missing from the hold keys | Added | Checked |
| 13 | Controls | Pause sliders | Low | Arrow keys could not move sliders | Arrows always blocked | Form fields left alone | Checked |
| 14 | Controls | Phones and tablets | High | Unplayable | Keyboard only | On-screen stick and buttons, rotate hint ([phone](screenshots/phone-controls.jpg)) | Checked (emulated phone, not a real one) |
| 15 | Physics | Everywhere | Medium | Catching on small corners | No corner handling | Sliding round corners; can always walk out if something closes on you | Verified |
| 16 | Characters | Chapter 1, veranda | High | Arjun stands on top of Ammachi in the key scene ([before](screenshots/before-ch1-overlap.jpg), [after](screenshots/after-ch1-spacing.jpg)) | People had no collision | People take up space | Verified |
| 17 | Characters | Most conversations | Medium | People talked facing away | Fixed facing direction | Both turn to each other | Verified |
| 18 | Characters | Everywhere | Medium | Stiff figures, same face for every emotion | No idle motion or expressions | Breathing, blinking, tears, smiles, shock and sadness taken from each line's acting direction | Checked |
| 19 | Characters | Chapter 3 | High | Ammachi in the kitchen and on the veranda at once | Both flags set | One at a time | Verified |
| 20 | Characters | Chapter 3, farm | Medium | Ammachi praises the soil from the house | She was never there | She walks down to the farm | Verified |
| 21 | Characters | Chapter 2, kitchen | Medium | Ammachi blocks the hearth ([before](screenshots/before-hearth-blocked.jpg)) | Her spot was in front of it | Moved beside it | Verified |
| 22 | Characters | Funeral | Medium | Arjun in a green shirt while all wear white ([before](screenshots/before-funeral-shirt.jpg), [after](screenshots/after-funeral-white.jpg)) | Wrong outfit | White shirt and mundu | Verified |
| 23 | Story | Chapters 1 to 5 | High | "Three days later", then Day 3; day counter jumps | Days numbered per chapter | One timeline: 1, 2, 5, 6, 7, 8, 9, 10 | Verified |
| 24 | Story | Chapter 2, lunch | Low | "Just like last night" was four days ago | Left over | Reworded | Verified |
| 25 | Story | Chapter 4 | Medium | Meera still says "fix the scooter" after it runs | Hook never updated | New line | Verified |
| 26 | Story | Chapter 5 | Medium | Sasi's crowbar never returned; Latha's injection forgotten | No follow-up | Optional errands in Mission 13 | Checked |
| 27 | Story | Chapter 5 morning | High | Jomon's auto parked in the garden and drove through the fence | Wrong coordinates | Parked on the lane, drives off by road | Verified |
| 28 | Story | Chapter 5 evening | Low | Evidence "hidden under the bed" still in the inventory; envelope hidden under Arjun | Not cleared; same spot | Cleared; envelope moved | Verified |
| 29 | Text | Narration | Medium | 30 or more lines shown too briefly (up to 36 characters a second) | Fixed durations | Time now scales with length | Verified |
| 30 | Text | Calls, letter, voices from other rooms | Medium | Speaker not on screen, no hint why | No source shown | "(on the phone)", "(from the kitchen)"; phone voices sound like a phone | Verified |
| 31 | UI | Dialogue | Medium | Box covers the people talking ([before](screenshots/before-subtitle-covers-dinner.jpg)) | Always at the bottom | Moves to the top when needed | Verified |
| 32 | UI | Dialogue | Low | "E / Space" hint overlaps the text | No space kept for it | Space kept | Verified |
| 33 | UI | Inventory | Medium | Two rows cover the "E" prompt | Fixed offset | Prompt sits above the inventory | Verified |
| 34 | UI | Music card | Low | Covers subtitles | Bottom right | Moved under the status panel | Verified |
| 35 | UI | Funeral | Medium | No objective marker | Missing | Added | Verified |
| 36 | UI | Chapter 4 | Medium | "Clean the scooter" marker pointed at the well | Task id shared with Chapter 2 | Renamed | Verified |
| 37 | UI | Browser tab, shared links | Low | No icon, no preview | Missing | Icon, description and preview image | Checked |
| 38 | Spelling | Sickle | Low | "arival" | Typo | "arivaal" | Checked |
| 39 | Environment | House | Medium | TV stand half-blocks the bathroom door | Placement | Moved | Verified |
| 40 | Environment | Office | Medium | Workers overlap the player, no chairs, bare room ([before](screenshots/before-office.jpg), [after](screenshots/after-office.jpg)) | Placement | Seated at desks, furniture added | Verified |
| 41 | Environment | Pond and hut | Low | Stray orange patch; thatch lines past the roof; flat river ([before](screenshots/before-pond-hut.jpg), [after](screenshots/after-pond-hut.jpg)) | Drawing | Path joined up, roof fixed, moving light and waterline on the river | Checked |
| 42 | Environment | Jomon's auto | Low | "KL-05" mirrored ([before](screenshots/before-mirrored-auto.jpg)) | Sprite flip | Text drawn unflipped | Checked |
| 43 | Environment | Night | Medium | Too dark to read signs | Darkness level | Slightly lighter, shop lights | Checked |
| 44 | Environment | Village | Medium | Felt empty | No life | Villagers, children playing, a cyclist, a dog, egrets that fly off, butterflies, fireflies ([village](screenshots/after-village-life.jpg), [night](screenshots/after-night-fireflies.jpg)) | Verified |
| 45 | Environment | Scrap yard | Medium | Player caught between shop and heaps | Gap too narrow | Heaps spread out | Checked (all 5 reachable) |
| 46 | Camera | Conversations | Low | Flat and distant | Fixed zoom | Camera leans in and settles between speakers ([example](screenshots/after-conversation-camera.jpg)) | Verified |
| 47 | Audio | Scooter | High | Script error when two frames share a timestamp | Division by zero | Guarded | Verified |
| 48 | Audio | Dialogue | Medium | Short gap before some lines | Loaded on demand | The next three lines load in advance | Checked |
| 49 | Audio | Pause | Medium | Voices ran on while paused | Not linked | Voice holds and resumes | Checked (measured) |
| 50 | Audio | Chapters 1, 3 and 5 | Low | Door knocks sounded like tapping | Generic sound | Real door knock and creak | Checked |
| 51 | Balance | Scooter | Medium | A litre ran out in about two crossings of the village | Consumption too high | Lasts three times longer | Checked |
| 52 | Performance | HUD | Low | Panels rewritten 60 times a second | No change check | Rewritten only on change | Checked |
| 53 | Performance | High-density screens, phones | Low | Needless pixels and memory | Uncapped resolution, stereo loops | Capped at 2x; phones load one channel | Checked |
| 54 | Robustness | Settings | Low | Damaged saved settings would stop the game | No guard | Falls back to defaults | Checked |

## Measurements

| What | Result |
|---|---|
| Final run, Prologue to the end of Chapter 5 | Completed, 0 errors |
| Voice lines played | 150 of 155 (the other 5 are four optional memories and the football win line) |
| Checkpoints restored | 10 of 10 |
| Drawing cost per frame (CPU) | 0.2 to 1.2 ms; 4.4 ms worst, first frame in the village |
| Voice peaks at the output | -9.6 to -12.6 dB |
| Garden ambience with music | -15 dB peak, -28.5 dB average |
| Loudest with everything at once | -9.5 dB |

After that final run, issues 45, 51 and 3 and the phone subtitle size were changed and checked directly rather than by another full run.

## Known limits (Open)

| # | Severity | Limit |
|---|---|---|
| A | Medium | Nobody has judged the voices and music by ear in this review; levels and transcriptions were measured |
| B | Medium | Touch controls tested in an emulated phone, not on a real one |
| C | Low | Tested in Chromium only, not Safari or Firefox |
| D | Low | The bot skips the football match with Esc, so its balance was not re-tested here |
| E | Low | The tea shop songs need internet and may show YouTube ads; the bundled song is the fallback |
