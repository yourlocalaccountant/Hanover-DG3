# Verification

Rebuilt DG3 operation, checked on 23 October 2026.

- 55 automated tests passed with zero failures (npm test).
- 24 live Chromium assertions passed with zero page errors.
- Browser checks cover each manual entry frame, unchanged signs during entry/preview, acceptance, menu return position, route browsing, date/time/timezone progression, explicit clock confirmation/cancellation, on-screen timed-info editing, held F/E and automatic status return.
- Native controller drawing has no image overlay, browser forms or workbench. USB is decorative and only four physical buttons are exposed.
- Widths 360, 390, 768, 1280 and 1920 have no page overflow and retain all keys on-screen.
- Screenshots and browser assertions are kept in ignored .runtime/ files; they are not application dependencies.

## Delivery gate

- R-02 PASS: No em dash in interface copy.
- R-03 PASS: Five browser widths have no page overflow.
- R-17 PASS: No fabricated product statistics.
- R-18 PASS: No testimonials or invented customers.
- R-23 PASS: Controller geometry and marks follow the explicitly supplied image reference.
- R-24 PASS: No page navigation or ghost links.
- R-25 PASS: Dynamic OLED colors exceed AA contrast; physical keys have accessible labels.
- R-26 PASS: All four visible controls were exercised; the USB cover has no button semantics.
- R-27 PASS: Boot, entry, errors, no-data, test and power-off states remain implemented.
- R-28 PASS: No generic FAQ.
- R-32 PASS: Native buttons, focus outlines, key mapping and live screen descriptions are present.
- R-33 PASS: Features are authored in repository source; the formatter only reformatted syntax.
- R-34 PASS: One intentional hardware theme; no incomplete theme toggle.
- R-35 PASS: Final operating flows were exercised in Chromium and the test runner.
- R-36 PASS: No invented compliance or exact-firmware claims.
- R-37 PASS: User image and hardware-only brief set the design direction.
- R-38 PASS: Sample routes and simulator limitations are documented.
- R-01 PASS: Gradients reproduce metal, plastic and key surfaces from the reference.
- R-04 PASS: Only relevant physical navigation symbols and supplied brand reference.
- R-06 PASS: Bitmap glyphs represent hardware displays.
- R-07 PASS: Dot arrays are functional sign pixels, not background decoration.
- R-08 PASS: Arrows exist only on the directional keys.
- R-09 PASS: No decorative badges.
- R-10 PASS: No glassmorphism.
- R-12 PASS: Shadows describe physical key depth.
- R-13 PASS: No page-wide glow treatment.
- R-14 PASS: Sign widths follow sample device dimensions, not feature cards.
- R-19 PASS: Motion is display scrolling, cursor, test and key feedback.
- R-22 PASS: No unrelated illustration.
- Liveliness PASS: ENERGY 1 / RHYTHM 2 / MOTION 1, physical controller focal point and structural spacing.
- C-1 PASS: Visual decisions follow the supplied controller reference.
- C-2 PASS: Visible controls perform real operations.
- C-3 PASS: Only the requested physical system is shown.
- C-4 PASS: Keyboard, states and five viewport widths checked.
- C-5 PASS: No fabricated proof or claims.
- R-05 PASS: Hardware-driven layout rather than a website template.
- R-11 PASS: Circular keys match the actual controller.
- R-15 PASS: No promotional CTAs.
- R-16 PASS: No AI marketing language.
- R-20 PASS: Native DG3 geometry and live pixel output identify this system.
- R-21 PASS: Dark surroundings support illuminated hardware.
- R-29 PASS: Neutral surfaces with reference yellow and amber output.
- R-30 PASS: The user explicitly requested the Hanover reference.
- R-31 PASS: Reasons are recorded in DESIGN.md.

Manual comparisons and explicit simulation limits are in docs/behaviour.md. No physical DG3 unit was available for side-by-side verification.
