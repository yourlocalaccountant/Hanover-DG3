import test from 'node:test';
import assert from 'node:assert/strict';
import { DG3 } from '../src/engine.mjs';
import { Keypad } from '../src/keypad.mjs';
import { CONFIG_OPTIONS } from '../src/data.mjs';
const tap = (controller, ...keys) => keys.forEach(key => controller.key(key));
function enter(controller, kind, value) { controller.startEntry(kind, kind + ':', kind === 'dest' ? 10 : 4); for (const character of value)
    controller.typeDigit(character); controller.key('fe'); }
function unlock(controller) { enter(controller, 'lock', '0101'); }
test('manual pp30-31: each code-entry frame and acceptance', () => {
    const d = new DG3();
    tap(d, 'fe');
    assert.equal(d.displayText().lines[0], 'Dest no: _');
    assert.equal(d.displayText().entry.previous, '0023');
    tap(d, 'up');
    assert.equal(d.displayText().lines[0], 'Dest no: 0');
    tap(d, 'up');
    assert.equal(d.displayText().lines[0], 'Dest no: 1');
    tap(d, 'left', 'up');
    assert.equal(d.displayText().lines[0], 'Dest no: 10');
    for (const expected of ['11', '12', '13', '14']) {
        tap(d, 'up');
        assert.equal(d.displayText().lines[0], 'Dest no: ' + expected);
        assert.equal(d.dest, '0023');
    }
    tap(d, 'fe');
    assert.equal(d.dest, '0014');
    assert.equal(d.mode, 'normal');
});
test('DS controls display padding without restricting ten-character destination codes', () => {
    const d = new DG3();
    d.database.destinations.push({ code: '1234567890', route: '90', driver: 'TEST', front: ['TEST'], side: ['TEST'], rear: [] });
    tap(d, 'fe');
    for (const digit of '1234567890')
        d.typeDigit(digit);
    tap(d, 'fe');
    assert.equal(d.current().code, '1234567890');
});
test('Left does not wrap into and overwrite the first digit at the entry limit', () => {
    const d = new DG3();
    d.startEntry('lock', 'Lock code:', 4, '0101');
    for (let i = 0; i < 7; i++)
        d.key('left');
    assert.equal(d.entry.cursor, 3);
    d.key('up');
    assert.equal(d.entry.buffer, '0102');
});
test('unfinished entries leave all three passenger signs on the accepted destination', () => {
    const d = new DG3(), before = ['front', 'side', 'rear'].map(s => d.signContent(s));
    tap(d, 'fe', 'up', 'up', 'left', 'up');
    assert.deepEqual(['front', 'side', 'rear'].map(s => d.signContent(s)), before);
    d.tick(d.lastInteraction + 20000);
    assert.equal(d.mode, 'normal');
    assert.equal(d.dest, '0023');
});
test('manual p34: returning from a submenu preserves menu selection and option position', () => {
    const d = new DG3();
    unlock(d);
    tap(d, 'down', 'down', 'fe');
    const option = CONFIG_OPTIONS.findIndex(o => o[0] === 'RT');
    d.index = option;
    tap(d, 'fe', 'up', 'fe');
    assert.equal(d.index, option);
    tap(d, 'left');
    assert.equal(d.mainMenu()[d.index], 'Configure?');
    tap(d, 'fe');
    assert.equal(d.index, option);
});
test('manual p34: settings require explicit yes/no and do not auto-save on timeout', () => {
    const d = new DG3();
    unlock(d);
    d.config.RT = 1;
    d.changed = true;
    d.leaveMenu();
    d.tick(Date.now() + 60000);
    assert.equal(d.mode, 'confirm');
    tap(d, 'up');
    assert.equal(d.config.RT, 0);
});
test('manual p85: enter a route then preview destinations without transmitting until selected', () => {
    const d = new DG3();
    d.config.RB = 1;
    const old = d.dest;
    enter(d, 'route', '10');
    assert.equal(d.mode, 'browse');
    assert.equal(d.dest, old);
    assert.equal(d.browse.route, '10');
    tap(d, 'up');
    assert.equal(d.browse.list[d.browse.index].code, '0002');
    tap(d, 'fe');
    assert.equal(d.route, '10');
    assert.equal(d.dest, '0002');
});
test('route browse recognises HELEN ten-digit 00RRRRDDDD codes', () => {
    const d = new DG3();
    d.config.RB = 1;
    d.database.destinations = [{ code: '0000480014', route: '', driver: '48 RETURN', front: ['RETURN'], side: ['RETURN'], rear: [] }];
    enter(d, 'route', '48');
    assert.equal(d.mode, 'browse');
    tap(d, 'fe');
    assert.equal(d.current().code, '0000480014');
    assert.equal(d.dest, '0014');
});
test('invalid route reports Bad route and leaves its passenger displays blank', () => {
    const d = new DG3();
    d.config.RB = 1;
    enter(d, 'route', '987');
    assert.equal(d.displayText().lines[0], 'Bad route');
    assert.deepEqual(d.signContent('front').lines, []);
});
test('manual pp53-54: clock steps through day, month, year, hours, minutes and 15-minute timezone', () => {
    const d = new DG3();
    unlock(d);
    d.index = d.mainMenu().indexOf('Set clock?');
    tap(d, 'fe');
    assert.equal(d.fields[d.fieldIndex].name, 'day');
    for (const name of ['month', 'year', 'hour', 'minute', 'timezone']) {
        tap(d, 'fe');
        assert.equal(d.fields[d.fieldIndex].name, name);
    }
    const before = d.fields[d.fieldIndex].value;
    tap(d, 'up');
    assert.equal(d.fields[d.fieldIndex].value, before + 15);
    tap(d, 'fe');
    assert.equal(d.mode, 'clockConfirm');
    tap(d, 'up');
    assert.equal(d.timezone, 0);
});
test('clock confirm Left applies timezone and survives a saved restart', () => {
    const d = new DG3();
    unlock(d);
    d.startClock();
    d.fieldIndex = 5;
    d.fields[5].value = 780;
    tap(d, 'fe', 'left');
    assert.equal(d.timezone, 780);
    assert.equal(new DG3(d.snapshot()).timezone, 780);
});
test('clock calendar clamps the day when switching to a shorter month', () => {
    const d = new DG3();
    d.startClock();
    d.fields[0].value = 31;
    d.fields[1].value = 1;
    d.fields[2].value = 2025;
    d.fieldIndex = 1;
    tap(d, 'up');
    assert.equal(d.fields[0].value, 28);
});
test('network options are only exposed on an Ethernet-capable controller', () => {
    const d = new DG3();
    assert.equal(d.mainMenu().includes('Network'), false);
    d.hardware.ethernet = true;
    assert.equal(d.mainMenu().includes('Network'), true);
});
test('network values are entered on the controller, never via an external form', () => {
    const d = new DG3();
    unlock(d);
    d.hardware.ethernet = true;
    d.group = 'network';
    d.mode = 'settings';
    d.index = d.groupOptions().findIndex(x => x[0] === 'FTP_PORT');
    tap(d, 'fe');
    assert.equal(d.mode, 'entry');
    assert.equal(d.entry.kind, 'settingText');
    d.entry.buffer = '2121';
    tap(d, 'fe');
    assert.equal(d.network.FTP_PORT, '2121');
    assert.equal(d.mode, 'settings');
});
test('timed information is edited with controller keys', () => {
    const d = new DG3();
    unlock(d);
    d.group = 'config';
    d.mode = 'settings';
    d.index = CONFIG_OPTIONS.findIndex(x => x[0] === 'Q1');
    tap(d, 'fe');
    assert.equal(d.mode, 'fields');
    tap(d, 'up');
    for (let i = 0; i < 9; i++)
        d.key('fe');
    assert.equal(d.schedules.Q1.code, '01');
    assert.equal(d.mode, 'settings');
});
test('TV1 hour/minute entry uses whole fields; untouched time prompt still cycles to lock code', () => {
    const d = new DG3();
    d.config.TV = 1;
    tap(d, 'fe', 'fe', 'fe');
    assert.equal(d.entry.kind, 'time');
    tap(d, 'fe');
    assert.equal(d.entry.kind, 'lock');
    d.startEntry('time', 'Time:', 4);
    tap(d, 'up');
    assert.equal(d.mode, 'fields');
    assert.equal(d.fields[0].value, 1);
    tap(d, 'fe', 'up', 'fe');
    assert.equal(d.fixedTime, '01:01');
});
test('manual p86 RS star local mode is released by destination zero', () => {
    const d = new DG3();
    d.config.RM = 1;
    d.config.RP = 1;
    d.chooseDestination('14');
    assert.equal(d.remoteSelect('23'), false);
    d.chooseDestination('0');
    assert.equal(d.remoteSelect('23'), true);
});
test('manual p86 RS2 restores the last remotely selected destination', () => {
    const d = new DG3();
    d.config.RM = 1;
    d.config.RS = 2;
    d.remoteSelect('14');
    d.chooseDestination('23');
    d.reboot();
    assert.equal(d.dest, '0014');
});
test('selection restarts page timing at the first destination page', () => {
    const d = new DG3();
    d.database.destinations[1].pages = [{ front: ['FIRST'] }, { front: ['SECOND'] }];
    d.bootedAt = Date.now() - 99999;
    d.chooseDestination('23');
    assert.deepEqual(d.signContent('front', d.selectionAt + 1).lines, ['FIRST']);
    assert.deepEqual(d.signContent('front', d.selectionAt + 3001).lines, ['SECOND']);
});
test('disabling IN suppresses previously selected passenger information', () => {
    const d = new DG3();
    d.info = '32';
    d.config.IN = 0;
    assert.equal(d.activeInfo(Date.now()), '');
});
test('short F/E press acts once on release; long press opens temporary status without submitting', () => {
    const d = new DG3();
    let now = Date.now();
    const k = new Keypad(d, () => now);
    k.press('fe');
    assert.equal(d.mode, 'normal');
    k.release('fe');
    assert.equal(d.entry.kind, 'dest');
    k.press('fe');
    now += 3000;
    k.advance();
    assert.equal(d.mode, 'status');
    k.release('fe');
    assert.equal(d.mode, 'status');
    d.tick(now + 6000);
    assert.equal(d.mode, 'entry');
    assert.equal(d.entry.kind, 'dest');
});
test('held Up repeats and release or blur cancellation stops it', () => {
    const d = new DG3();
    d.key('fe');
    let now = Date.now();
    const k = new Keypad(d, () => now);
    k.press('up');
    assert.equal(d.entry.buffer, '0');
    now += 450;
    k.advance();
    assert.equal(d.entry.buffer, '1');
    k.cancel();
    now += 500;
    k.advance();
    assert.equal(d.entry.buffer, '1');
});
test('hot reboot provides the documented three-second reset-combination window', () => {
    const d = new DG3();
    d.system.LC = '1234';
    let now = Date.now();
    const k = new Keypad(d, () => now);
    k.press('fe');
    k.press('left');
    k.press('down');
    assert.equal(d.mode, 'boot');
    k.release('fe');
    k.release('down');
    now += 200;
    k.press('up');
    assert.equal(d.system.LC, '0101');
    assert.equal(d.database.destinations.length, 8);
});
