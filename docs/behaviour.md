# Documented operation

Reference: Hanover DG3 Installation and Operating Manual 540846-19, 13 November 2023, software V1.51.00.

| Flow | Manual | Implementation and verification |
| --- | --- | --- |
| Destination entry | pp. 30–31 | Prompt and pending code share the top line, accepted code remains below. Up begins at 0; Left advances; F/E transmits. Tests check every step of the 23-to-14 example. |
| Prompt cycle and inactivity | p. 29 | F/E cycles enabled destination, route, info, advert, time and lock prompts. Unfinished driver entry returns after 20 seconds without transmitting. |
| Locked functions | pp. 33–34 | 0101 opens the menu. Returning from submenus preserves the selected menu item and option. Configuration requires explicit save/discard. |
| Route browsing | p. 85 | Enter a route, preview its destinations, then confirm with F/E. Passenger signs keep the previous selection until confirmation. Ten-digit 00RRRRDDDD database codes are recognised. |
| Destination browsing | pp. 81–82 | BR requires DN and is separate from route browse. CB controls confirmation. |
| Round trip | p. 32 | Left opens outbound/return selection and F/E selects the stored journey. |
| Status | pp. 34–36 | Held F/E opens temporary status and restores the prior screen; locked status remains until explicitly exited. Network pages are conditional on Ethernet hardware. |
| Sign test | pp. 37, 64–65 | F/E starts test output; Up/Down toggles address view; Left returns to the menu. |
| Clock | pp. 53–54 | Sequential day, month, year, hour, minute and timezone fields use the physical keys. Timezone steps are 15 minutes. Left confirms the final screen; Up cancels. |
| Fixed time | pp. 37–40 | TV=1 edits hour/minute fields on the OLED. Untouched time prompts can be skipped with F/E. TV=2 accepts 1–99 countdown minutes. |
| Timed info | pp. 89–90 | Q1–Q8 use on-screen info/date/time fields. Daily time windows can be restricted to a date range. No browser form is opened. |
| Remote priority/reset | pp. 85–87 | RM/RP and RS control remote acceptance; the RS=* local latch is cleared by local destination 0 or info 99. RS=2 restores the last remotely selected value. |
| Page timing | p. 87 | T0/T1/T2 are deciseconds and restart from the new accepted selection rather than from application boot. |
| Resets | pp. 55–56 | Keypad layer handles power-on chords and the three-second hot-reboot reset window. Lock reset retains data; factory reset clears it. |

## Model and remaining limits

The default hardware model has RTC enabled and Ethernet disabled. The optional Network menu appears only when hardware.ethernet is enabled in the model. All exposed editors use the controller keys.

Front 160×24, side 96×16 and rear 32×16 are sample sign sizes, not DG3 controller specifications. The OLED is 256×64. Fonts and exact factory display timings are approximations where proprietary details are absent from the manual.

Customer-specific protocol options and configuration values are retained, but there is no connected vehicle computer, Hanvox, HTC, internal advert display or real communications interface. Those external hardware effects cannot be validated here. USB loading/dumping remains an engine test API; USB is deliberately decorative in the page, per the user's request.

The implementation was checked against the manual and automated/browser sequences, not against a physical DG3 unit. It does not execute Hanover firmware or parse proprietary ERIC.BIN files.
