# Hanover DG3

A locally hosted destination-controller simulator with front, side and rear LED signs. The controller is drawn in SVG/CSS from the supplied DG3.webp reference. Its four round keys operate the live OLED and destination system.

## Run

Requires Node.js 20 or newer. No dependencies or installation step.

```sh
npm start
```

Open **http://localhost:3303**. The server binds to the local PC only. Set PORT to use another port.

## Operate

- Click F/E, Left, Up and Down, or use Enter and the matching arrow keys.
- F/E cycles enabled prompts. On Dest no:, Up starts with 0; further Up/Down changes the active character. Left advances to the next character. F/E accepts the code.
- The accepted destination remains on the signs while a new code is entered. Unfinished driver entry times out after 20 seconds.
- Codes **23** and **14** select the manual's Lion Green / 382 and Brownford / 73A examples.
- Hold F/E for three seconds for temporary status. The default configuration lock is **0101**.
- Type numbers/letters while entering a code as a PC convenience. Escape cancels entry. P switches power.
- Hold Left + Up during power-on to restore the lock code; F/E + Up during power-on performs a factory reset. F/E + Left + Down performs a hot reboot with the documented reset-combination window.

The page contains only the three signs and the controller. USB is decorative. There is no workbench, file picker, browser settings form or photograph overlay. Settings, clock fields and timed-information fields are edited on the controller.

## Behaviour

Code entry, menu navigation, confirmation, route browsing, round trips, sign tests, RTC setting, held-key timing and reset behaviour follow [Hanover manual 540846-19, software V1.51.00](https://storage.e.jimdo.com/file/894a57b5-ef0b-4d75-97cb-6a1695fbfefc/DG3%20Destination%20Controller.pdf). [The behaviour notes](docs/behaviour.md) map the implemented flows to manual pages and describe the remaining limits.

Saved destinations, configuration and RTC settings persist in browser local storage. Factory reset clears the database as on the real controller. With the requested decorative USB, restoring the bundled database requires clearing this site's browser storage and reloading.

## Verify

```sh
npm test
```

55 automated tests cover the engine, keypad timing and pixel output. The live Chromium walkthrough passed 24 assertions covering physical-key entry, unchanged signs during preview, route browsing, menu return, clock fields and confirmation, timed-information entry, temporary status and five viewport widths. See [QA.md](QA.md).

## Source

- src/engine.mjs: controller state, destinations, configuration and sign output.
- src/entry.mjs: character entry using the physical keys.
- src/fields.mjs: date/time field handling.
- src/keypad.mjs: key-down/key-up, hold, repeat, power and reset chords.
- src/pixels.mjs: OLED and LED pixel rendering.
- src/app.mjs: DOM and keyboard binding.
- index.html / styles.css: native controller drawing and bare sign layout.

This is a simulator of documented operation. Proprietary firmware, HELEN BIN decoding, exact factory fonts, electrical interfaces and real serial/FTP traffic are not emulated. DG3.webp remains in the repository as the user-supplied visual reference; it is not used to render the interface.
