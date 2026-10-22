import { DEFAULT_CONFIG, DEFAULT_SYSTEM, DEFAULT_NETWORK, CONFIG_OPTIONS, SYSTEM_OPTIONS, PROTOCOLS, sampleDatabase, validateDatabase } from './data.mjs';
import { newEntry, changeDigit, nextDigit, typeCharacter, enteredValue, DIGITS, CODES, NETWORK_TEXT } from './entry.mjs';
import { clockFields, adjustField, fieldValues, validDate, timezoneText } from './fields.mjs';
const clone = value => structuredClone(value);
const sameCode = (a, b) => String(a).toUpperCase().replace(/^0+(?=.)/, '') === String(b).toUpperCase().replace(/^0+(?=.)/, '');
export class DG3 {
    constructor(saved = null) {
        this.config = { ...DEFAULT_CONFIG, ...saved?.config };
        this.system = { ...DEFAULT_SYSTEM, ...saved?.system };
        this.network = { ...DEFAULT_NETWORK, ...saved?.network };
        this.ports = { P0: 'SIGN', P1: '-', P2: '-', UDP1: '-', UDP2: '-', TCP1: '-', TCP2: '-', ...saved?.ports };
        this.signs = { S0: '*', S1: '*', S2: '*', LN: '-', EB: 0, ...saved?.signs };
        this.database = saved?.database ? validateDatabase(saved.database) : sampleDatabase();
        this.dest = saved?.dest ?? '0023';
        this.route = saved?.route ?? '';
        this.info = saved?.info ?? '';
        this.advert = saved?.advert ?? '';
        if (!this.route && !this.config.RN && !this.config.RB)
            this.route = this.database.destinations.find(d => sameCode(d.code, this.dest))?.route ?? '';
        this.out = saved?.out ?? '';
        this.returnDest = saved?.returnDest ?? '';
        this.nextTrip = 'out';
        this.schedules = saved?.schedules ?? {};
        this.power = true;
        this.mode = 'normal';
        this.index = 0;
        this.entry = null;
        this.draft = null;
        this.statusPage = 0;
        this.connected = [true, true, true];
        this.inputs = [false, false, false];
        this.inputOverride = null;
        this.manual = false;
        this.bootedAt = Date.now();
        this.lastInteraction = Date.now();
        this.changed = false;
        this.notice = '';
        this.usb = null;
        this.fixedTime = saved?.fixedTime ?? '00:00';
        this.countdownEnd = 0;
        this.clockOffset = saved?.clockOffset ?? 0;
        this.timezone = saved?.timezone ?? 0;
        this.testAddress = false;
        this.hardware = { rtc: true, ethernet: false, ...saved?.hardware };
        this.menuIndex = 0;
        this.settingsIndices = {};
        this.selectionAt = Date.now();
        this.lastRemote = saved?.lastRemote ?? null;
        this.localLatch = false;
    }
    snapshot() { return clone({ config: this.config, system: this.system, network: this.network, ports: this.ports, signs: this.signs, database: this.database, dest: this.dest, route: this.route, info: this.info, advert: this.advert, out: this.out, returnDest: this.returnDest, schedules: this.schedules, clockOffset: this.clockOffset, timezone: this.timezone, fixedTime: this.fixedTime, hardware: this.hardware, lastRemote: this.lastRemote }); }
    destinationCode(d) { return this.config.RB && /^\d{10}$/.test(d.code) ? d.code.slice(-4) : d.code; }
    destinationRoute(d) { return this.config.RB && /^\d{10}$/.test(d.code) ? String(Number(d.code.slice(0, 6))) : d.route; }
    current() { return this.find(this.dest); }
    find(code) { return this.database.destinations.find(d => (sameCode(d.code, code) || this.config.RB && sameCode(this.destinationCode(d), code)) && (!this.config.RB || sameCode(this.destinationRoute(d), this.route))); }
    prompts() {
        const p = [];
        if (this.config.RB || this.config.RN)
            p.push(['route', 'Route no:', this.config.RL]);
        if (this.config.DN || this.config.RB)
            p.push(['dest', 'Dest no:', this.config.RB ? 4 : 10]);
        if (this.config.IN && !this.config.HI)
            p.push(['info', 'Info no:', 2]);
        if (this.config.AN && !this.config.HA)
            p.push(['advert', 'Advert no:', 2]);
        if (this.hardware.rtc && [1, 2].includes(this.config.TV))
            p.push(['time', this.config.TV === 1 ? 'Time:' : 'Minutes:', this.config.TV === 1 ? 4 : 2]);
        p.push(['lock', 'Lock code:', 4]);
        return p;
    }
    startEntry(kind, label, max = 4, initial = '') { this.mode = 'entry'; const numeric = ['lock', 'info', 'advert', 'time', 'settingCode', 'usbLock', 'clock'].includes(kind); this.entry = newEntry(kind, label, max, initial, kind === 'settingText' ? NETWORK_TEXT : numeric ? DIGITS : CODES); }
    cyclePrompt() { const p = this.prompts(); this.index = this.mode === 'entry' ? (this.index + 1) % p.length : 0; this.startEntry(...p[this.index]); }
    captureDraft() { this.draft = clone({ config: this.config, system: this.system, network: this.network, ports: this.ports, signs: this.signs, schedules: this.schedules }); this.changed = false; }
    mainMenu() { const m = ['Show status?', 'Test signs?', 'Configure?', 'System?', 'Ports?', 'Signs?', 'Dump data?']; if (this.hardware.rtc)
        m.push('Set clock?'); if (this.hardware.ethernet)
        m.push('Network'); if (this.config.AM)
        m.push('AUTO/MAN'); m.push('Back'); return m; }
    returnMenu() { this.mode = 'menu'; this.index = this.menuIndex; }
    returnSettings() { this.mode = 'settings'; this.index = this.settingsIndices[this.group] ?? 0; }
    groupOptions() {
        if (this.group === 'config')
            return CONFIG_OPTIONS;
        if (this.group === 'system')
            return SYSTEM_OPTIONS;
        if (this.group === 'ports')
            return Object.keys(this.ports).map(k => [k, k.startsWith('P') ? `Port ${k.slice(1)}` : k, PROTOCOLS]);
        if (this.group === 'signs')
            return [...Array.from({ length: 15 }, (_, i) => ['S' + i.toString(16).toUpperCase(), 'Sign ' + i, ['-', '*', ...Array.from({ length: 24 }, (_, j) => j), 'EX', 'HV', 'HANCIS/HTC', 'RN', 'NN']]), ['LN', 'Internal Sign Number', ['-', ...Array.from({ length: 24 }, (_, j) => j)]], ['EB', 'Escaped Binary', [0, 1]]];
        return Object.keys(this.network).map(k => [k, k, 'text']);
    }
    target() { return this[this.group === 'system' ? 'system' : this.group === 'config' ? 'config' : this.group === 'ports' ? 'ports' : this.group === 'signs' ? 'signs' : 'network']; }
    chooseDestination(code, remote = false) {
        this.dest = String(code).toUpperCase().padStart(this.config.DS, '0');
        this.manual = !remote;
        this.selectionAt = Date.now();
        this.badRoute = false;
        if (!remote && this.config.RM && this.config.RS === '*')
            this.localLatch = Number(code) !== 0;
        if (!remote && Number(code) === 0) {
            this.manual = false;
            this.localLatch = false;
        }
        if (this.config.QG >= 10)
            this.info = '';
        const current = this.current();
        if (current && !this.config.RN && !this.config.RB)
            this.route = current.route;
        if (this.inputOverride?.latched) {
            const v = this.inputOverride.type;
            if (['1', '2', '9', '10'].includes(v) || (remote && ['1B', '1C'].includes(v)) || (!remote && ['1A', '1C'].includes(v)))
                this.inputOverride = null;
        }
        this.mode = 'normal';
        this.entry = null;
        this.index = 0;
    }
    commitEntry() {
        const e = this.entry;
        const value = enteredValue(e);
        if (e.kind === 'lock') {
            if (value.padStart(4, '0') === String(this.system.LC).padStart(4, '0')) {
                this.captureDraft();
                this.mode = 'menu';
                this.index = 0;
                this.menuIndex = 0;
            }
            else {
                this.flash('Incorrect lock code');
                this.entry.buffer = '';
                this.entry.cursor = 0;
            }
            return;
        }
        if (e.kind === 'dest') {
            this.chooseDestination(value);
            return;
        }
        if (e.kind === 'route') {
            if (this.config.RB) {
                this.startBrowse(value);
                return;
            }
            this.route = this.config.RZ ? value : value.replace(/^0+(?=.)/, '');
            this.mode = 'normal';
            this.manual = true;
            this.selectionAt = Date.now();
            return;
        }
        if (e.kind === 'info' || e.kind === 'advert') {
            this[e.kind] = Number(value) === 0 ? '' : value.padStart(2, '0');
            if (e.kind === 'info' && Number(value) === 99 && this.config.RM) {
                this.info = '';
                this.manual = false;
                this.localLatch = false;
            }
            this.selectionAt = Date.now();
            this.mode = 'normal';
            return;
        }
        if (e.kind === 'out' || e.kind === 'return') {
            this[e.kind === 'out' ? 'out' : 'returnDest'] = value.padStart(this.config.DS, '0');
            this.chooseDestination(value);
            this.nextTrip = e.kind === 'out' ? 'return' : 'out';
            return;
        }
        if (e.kind === 'time') {
            if (this.config.TV === 1) {
                const v = value.padStart(4, '0');
                if (+v.slice(0, 2) > 23 || +v.slice(2) > 59) {
                    this.flash('Invalid time');
                    return;
                }
                this.fixedTime = v.slice(0, 2) + ':' + v.slice(2);
            }
            else {
                if (Number(value) < 1 || Number(value) > 99) {
                    this.flash('Enter 1 to 99 minutes');
                    return;
                }
                this.countdownEnd = Date.now() + Number(value) * 60000;
                if (String(this.config.CC).startsWith('I'))
                    this.info = String(this.config.CC).slice(1).padStart(2, '0');
                else
                    this.chooseDestination(this.config.CC);
            }
            this.mode = 'normal';
            return;
        }
        if (e.kind === 'settingCode') {
            this.target()[this.editOption[0]] = value.padStart(4, '0');
            this.changed = true;
            this.returnSettings();
            return;
        }
        if (e.kind === 'settingText') {
            if (this.commitNetwork(value)) {
                this.changed = true;
                this.returnSettings();
            }
            return;
        }
        if (e.kind === 'usbLock') {
            if (value.padStart(4, '0') !== String(this.system.LC).padStart(4, '0')) {
                this.flash('Incorrect USB lock code');
                return;
            }
            this.usb.phase = 'loading';
            this.mode = 'usb';
            this.usb.since = Date.now();
            return;
        }
        if (e.kind === 'clock') {
            const v = value.padStart(12, '0');
            const [day, month, year, hour, min] = [+v.slice(0, 2), +v.slice(2, 4), +v.slice(4, 8), +v.slice(8, 10), +v.slice(10, 12)];
            const d = new Date(year, month - 1, day, hour, min);
            if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day || hour > 23 || min > 59) {
                this.flash('Invalid date / time');
                return;
            }
            this.pendingClock = d.getTime() - Date.now();
            this.mode = 'clockConfirm';
            return;
        }
    }
    flash(message) { this.notice = message; this.noticeUntil = Date.now() + 1800; }
    startBrowse(route = this.route, step = 0) {
        const list = this.database.destinations.filter(d => !/^BR|^BS/.test(d.code) && (!this.config.RB || sameCode(this.destinationRoute(d), route)));
        if (this.config.BI === 2 || this.config.BI === 1 && this.config.RM)
            list.unshift({ code: '0000', route, driver: 'Idle', front: [], side: [], rear: [] });
        if (!list.length) {
            this.badRoute = true;
            this.route = route;
            this.mode = 'normal';
            return;
        }
        const current = list.findIndex(d => sameCode(this.destinationCode(d), this.dest));
        this.browse = { route, list, index: ((current < 0 ? 0 : current) + step + list.length) % list.length };
        this.mode = 'browse';
        this.entry = null;
    }
    acceptBrowse() {
        const { route, list, index } = this.browse;
        const code = this.destinationCode(list[index]);
        if (this.config.RB)
            this.route = route;
        this.badRoute = false;
        this.chooseDestination(code);
    }
    startClock() { this.fields = clockFields(Date.now() + this.clockOffset, this.timezone); this.fieldIndex = 0; this.fieldKind = 'clock'; this.mode = 'fields'; }
    startTime() {
        const [hour, minute] = this.fixedTime.split(':').map(Number);
        this.fields = [{ name: 'hour', value: hour, min: 0, max: 23, pad: 2 }, { name: 'minute', value: minute, min: 0, max: 59, pad: 2 }];
        this.fieldIndex = 0;
        this.fieldKind = 'time';
        this.mode = 'fields';
    }
    startSchedule(code) {
        const s = this.schedules[code];
        const date = t => (t || '01/01').split('/').map(Number), time = t => (t || '00:00').split(':').map(Number);
        const [sd, sm] = date(s?.startDate), [ed, em] = date(s?.endDate || '31/12'), [sh, sn] = time(s?.startTime), [eh, en] = time(s?.endTime || '23:59');
        this.fields = [['info', Number(s?.code || 0), 0, 99], ['startDay', sd, 1, 31], ['startMonth', sm, 1, 12], ['endDay', ed, 1, 31], ['endMonth', em, 1, 12], ['startHour', sh, 0, 23], ['startMinute', sn, 0, 59], ['endHour', eh, 0, 23], ['endMinute', en, 0, 59]].map(([name, value, min, max]) => ({ name, value, min, max, pad: 2 }));
        this.fieldKind = 'schedule';
        this.scheduleCode = code;
        this.fieldIndex = 0;
        this.mode = 'fields';
    }
    handleFields(key) {
        const field = this.fields[this.fieldIndex];
        if (key === 'up' || key === 'down') {
            adjustField(field, key === 'up' ? 1 : -1);
            if (this.fieldKind === 'clock' && ['month', 'year'].includes(field.name)) {
                const v = fieldValues(this.fields);
                this.fields[0].max = new Date(v.year, v.month, 0).getDate();
                this.fields[0].value = Math.min(this.fields[0].value, this.fields[0].max);
            }
            return;
        }
        if (key === 'left') {
            if (this.fieldKind === 'time')
                this.fieldIndex = 1 - this.fieldIndex;
            else if (this.fieldIndex > 0)
                this.fieldIndex--;
            else if (this.fieldKind === 'clock')
                this.returnMenu();
            else
                this.returnSettings();
            return;
        }
        if (key !== 'fe')
            return;
        if (this.fieldIndex < this.fields.length - 1) {
            this.fieldIndex++;
            return;
        }
        const values = fieldValues(this.fields), pad = n => String(n).padStart(2, '0');
        if (this.fieldKind === 'clock') {
            if (!validDate(values)) {
                this.flash('Invalid date');
                this.fieldIndex = 0;
                return;
            }
            this.pendingClock = new Date(values.year, values.month - 1, values.day, values.hour, values.minute).getTime() - Date.now();
            this.pendingTimezone = values.timezone;
            this.mode = 'clockConfirm';
        }
        else if (this.fieldKind === 'time') {
            this.fixedTime = pad(values.hour) + ':' + pad(values.minute);
            this.mode = 'normal';
        }
        else {
            if (!validDate({ year: 2024, month: values.startMonth, day: values.startDay }) || !validDate({ year: 2024, month: values.endMonth, day: values.endDay })) {
                this.flash('Invalid date');
                this.fieldIndex = 1;
                return;
            }
            if (values.info === 0)
                delete this.schedules[this.scheduleCode];
            else
                this.schedules[this.scheduleCode] = { code: pad(values.info), startDate: pad(values.startDay) + '/' + pad(values.startMonth), endDate: pad(values.endDay) + '/' + pad(values.endMonth), startTime: pad(values.startHour) + ':' + pad(values.startMinute), endTime: pad(values.endHour) + ':' + pad(values.endMinute) };
            this.changed = true;
            this.returnSettings();
        }
    }
    commitNetwork(value) {
        const key = this.editOption[0];
        if (/^(IP_ADDRESS|SUBNET_MASK|DEFAULT_GATEWAY|DNS_SERVER|UDP[12]_IP|TCP[12]_IP)$/.test(key) && (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value) || value.split('.').some(x => +x > 255))) {
            this.flash('Invalid IPv4 address');
            return false;
        }
        if ((/_PORT$/.test(key) || key === 'CONFIG PORT') && (!/^\d+$/.test(value) || +value < 1 || +value > 65535)) {
            this.flash('Invalid port');
            return false;
        }
        if ((key === 'UNIT_ID' || key.includes('PASSWORD') || key.includes('USER_NAME')) && value.length > 29) {
            this.flash('Maximum 29 characters');
            return false;
        }
        this.network[key] = value;
        return true;
    }
    key(key) {
        if (!this.power)
            return;
        this.lastInteraction = Date.now();
        this.notice = '';
        if (this.mode === 'boot' || this.mode === 'usb')
            return;
        if (this.mode === 'confirm') {
            if (key === 'left' || key === 'fe') {
                this.changed = false;
                this.draft = null;
                this.mode = 'normal';
            }
            if (key === 'up' || key === 'down') {
                Object.assign(this, this.draft);
                this.draft = null;
                this.changed = false;
                this.mode = 'normal';
            }
            return;
        }
        if (this.mode === 'clockConfirm') {
            if (key === 'left') {
                this.clockOffset = this.pendingClock;
                this.timezone = this.pendingTimezone;
                this.returnMenu();
            }
            if (key === 'up')
                this.returnMenu();
            return;
        }
        if (this.mode === 'fields') {
            this.handleFields(key);
            return;
        }
        if (this.mode === 'browse') {
            if (key === 'fe')
                this.acceptBrowse();
            else if (key === 'left') {
                this.mode = 'normal';
                this.browse = null;
            }
            else
                this.browse.index = (this.browse.index + (key === 'up' ? 1 : -1) + this.browse.list.length) % this.browse.list.length;
            return;
        }
        if (this.mode === 'status') {
            if (key === 'fe' || key === 'left') {
                if (this.quickReturn) {
                    Object.assign(this, this.quickReturn);
                    this.quickReturn = null;
                }
                else
                    this.returnMenu();
                return;
            }
            const count = this.hardware.ethernet ? 6 : 4;
            this.statusPage = (this.statusPage + (key === 'up' ? -1 : 1) + count) % count;
            return;
        }
        if (this.mode === 'test') {
            if (key === 'up' || key === 'down')
                this.testAddress = !this.testAddress;
            if (key === 'left')
                this.returnMenu();
            if (key === 'fe')
                this.leaveMenu();
            return;
        }
        if (this.mode === 'dump') {
            if (key === 'left') {
                this.returnMenu();
                this.usb = null;
            }
            return;
        }
        if (this.mode === 'normal') {
            if (key === 'fe') {
                this.cyclePrompt();
                return;
            }
            if (key === 'left' && this.config.RT) {
                const kind = this.nextTrip;
                const v = this[kind === 'out' ? 'out' : 'returnDest'];
                this.startEntry(kind, kind === 'out' ? 'Out no:' : 'Return no:', 10, v);
                return;
            }
            if ((key === 'up' || key === 'down') && (this.config.BR && this.config.DN || this.config.RB)) {
                this.startBrowse(this.route, key === 'up' ? 1 : -1);
                if (this.mode === 'browse' && !this.config.CB && !this.config.RB)
                    this.acceptBrowse();
            }
            return;
        }
        if (this.mode === 'entry') {
            const e = this.entry;
            if (key === 'fe') {
                if (enteredValue(e))
                    this.commitEntry();
                else
                    this.cyclePrompt();
                return;
            }
            if (key === 'left') {
                nextDigit(e);
                return;
            }
            if (key === 'up' || key === 'down') {
                if (e.kind === 'time' && this.config.TV === 1) {
                    this.startTime();
                    this.handleFields(key);
                }
                else
                    changeDigit(e, key === 'up' ? 1 : -1);
            }
            return;
        }
        if (this.mode === 'edit') {
            if (key === 'left') {
                this.returnSettings();
                return;
            }
            if (key === 'fe') {
                const k = this.editOption[0];
                if (this.group === 'ports' && this.editValue !== '-' && Object.entries(this.ports).some(([p, v]) => p !== k && v === this.editValue)) {
                    this.flash('Protocol already assigned');
                    return;
                }
                this.target()[k] = this.editValue;
                if (this.group === 'ports' && /^HANO-[12]F?$/.test(this.editValue))
                    this.config.RM = 1;
                this.changed = true;
                this.returnSettings();
                return;
            }
            const opt = this.editOption;
            if (Array.isArray(opt[2])) {
                const values = opt[2];
                const i = values.findIndex(x => String(x) === String(this.editValue));
                this.editValue = values[(i + (key === 'up' ? 1 : -1) + values.length) % values.length];
            }
            else if (typeof opt[2] === 'number') {
                this.editValue = Math.max(opt[2], Math.min(opt[3], Number(this.editValue) + (key === 'up' ? 1 : -1) * (opt[4] || 1)));
            }
            return;
        }
        if (this.mode === 'settings') {
            const options = this.groupOptions();
            if (key === 'left') {
                this.settingsIndices[this.group] = this.index;
                this.returnMenu();
                return;
            }
            if (key === 'fe') {
                if (this.index === options.length) {
                    this.returnMenu();
                    return;
                }
                this.settingsIndices[this.group] = this.index;
                this.editOption = options[this.index];
                this.editValue = this.target()[this.editOption[0]] ?? (this.editOption[2] === 'schedule' ? '' : '*');
                if (this.editOption[2] === 'code') {
                    this.startEntry('settingCode', 'Lock code:', 4, String(this.editValue));
                    return;
                }
                if (this.editOption[2] === 'text') {
                    this.startEntry('settingText', this.editOption[0] + ':', this.editOption[0].includes('USER_NAME') || this.editOption[0].includes('PASSWORD') || this.editOption[0] === 'UNIT_ID' ? 29 : 64, String(this.editValue));
                    if (/USER_NAME|PASSWORD/.test(this.editOption[0]))
                        this.entry.alphabet = DIGITS + 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    return;
                }
                if (this.editOption[2] === 'schedule') {
                    this.startSchedule(this.editOption[0]);
                    return;
                }
                this.mode = 'edit';
                return;
            }
            this.index = (this.index + (key === 'up' ? -1 : 1) + options.length + 1) % (options.length + 1);
            return;
        }
        if (this.mode === 'menu') {
            const list = this.mainMenu();
            if (key === 'left') {
                this.leaveMenu();
                return;
            }
            if (key === 'fe') {
                const choice = list[this.index];
                this.menuIndex = this.index;
                if (choice === 'Show status?') {
                    this.mode = 'status';
                    this.statusPage = 0;
                    return;
                }
                if (choice === 'Test signs?') {
                    this.mode = 'test';
                    this.testStart = Date.now();
                    this.testAddress = false;
                    return;
                }
                const groups = { 'Configure?': 'config', 'System?': 'system', 'Ports?': 'ports', 'Signs?': 'signs', 'Network': 'network' };
                if (groups[choice]) {
                    this.group = groups[choice];
                    this.returnSettings();
                    return;
                }
                if (choice === 'Dump data?') {
                    this.mode = 'dump';
                    this.dumpStart = Date.now();
                    return;
                }
                if (choice === 'Set clock?') {
                    this.startClock();
                    return;
                }
                if (choice === 'AUTO/MAN') {
                    this.manual = !this.manual;
                    this.flash(this.manual ? 'MANUAL mode' : 'AUTO mode');
                    return;
                }
                this.leaveMenu();
                return;
            }
            this.index = (this.index + (key === 'up' ? -1 : 1) + list.length) % list.length;
        }
    }
    typeDigit(digit) { if (this.mode !== 'entry' || !this.power)
        return; this.lastInteraction = Date.now(); typeCharacter(this.entry, digit); }
    leaveMenu() { if (this.changed)
        this.mode = 'confirm';
    else {
        this.mode = 'normal';
        this.draft = null;
        this.index = 0;
    } }
    showStatus() { if (!this.power || ['usb', 'boot', 'status'].includes(this.mode))
        return; this.quickReturn = { mode: this.mode, index: this.index, entry: this.entry }; this.mode = 'status'; this.statusPage = 0; this.statusUntil = Date.now() + 5000; this.lastInteraction = Date.now(); }
    reboot(kind = 'normal') {
        if (this.draft)
            Object.assign(this, this.draft);
        if (kind === 'factory') {
            this.config = { ...DEFAULT_CONFIG };
            this.system = { ...DEFAULT_SYSTEM };
            this.signs = { S0: '*', S1: '*', S2: '*', LN: '-', EB: 0 };
            this.ports = { P0: 'SIGN', P1: '-', P2: '-', UDP1: '-', UDP2: '-', TCP1: '-', TCP2: '-' };
            this.network = { ...DEFAULT_NETWORK };
            this.database = { format: 'dg3-simulator-v1', name: 'No data', destinations: [], information: [], adverts: [] };
            this.dest = '0000';
            this.route = '';
            this.info = '';
            this.advert = '';
            this.schedules = {};
        }
        if (kind === 'lock')
            this.system.LC = '0101';
        if (kind === 'normal') {
            const remote = Boolean(this.config.RM);
            for (const [field, override] of [['dest', 'RSD'], ['route', 'RSR'], ['info', 'RSI'], ['advert', 'RSA']]) {
                const reset = this.config[override] === '*' ? this.config.RS : this.config[override];
                if (Number(reset) === 2)
                    this[field] = remote ? (this.lastRemote?.[field] ?? '') : '';
                else if (Number(reset) === 1 || remote && reset === '*')
                    this[field] = '';
            }
        }
        this.power = true;
        this.mode = 'boot';
        this.bootKind = kind;
        this.bootedAt = Date.now();
        this.bootUntil = Date.now() + 1300;
        this.draft = null;
        this.changed = false;
        this.inputs = [false, false, false];
        this.inputOverride = null;
        this.manual = false;
        this.localLatch = false;
        this.blankAt = null;
        this.quickReturn = null;
        this.notice = '';
        this.entry = null;
        this.badRoute = false;
        this.selectionAt = Date.now();
    }
    togglePower(kind = 'normal') { if (this.power) {
        if (this.draft)
            Object.assign(this, this.draft);
        this.draft = null;
        this.changed = false;
        this.power = false;
        this.mode = 'normal';
        this.inputOverride = null;
    }
    else
        this.reboot(kind); }
    insertUSB(data, locked = false) {
        if (!this.power)
            throw new Error('Power on the controller first.');
        if (this.mode === 'boot' || this.mode === 'usb')
            throw new Error('Wait for the current operation to finish.');
        if (this.draft && this.mode !== 'dump')
            throw new Error('Return to the main screen and save or discard settings before loading USB data.');
        if (this.mode === 'dump') {
            this.usb = { phase: 'dump', data: clone(this.database), since: Date.now() };
            this.mode = 'usb';
            return;
        }
        if (!this.system.EBN)
            throw new Error('USB database loading is disabled (System > EBN).');
        if (this.system.UP === 'Disabled' && Date.now() - this.lastInteraction > 120000)
            throw new Error('USB power is off. Enter the lock code first.');
        const db = validateDatabase(data);
        this.usb = { phase: locked ? 'locked' : 'loading', data: db, since: Date.now() };
        this.draft = null;
        this.changed = false;
        if (locked)
            this.startEntry('usbLock', 'USB lock code:', 4);
        else
            this.mode = 'usb';
    }
    ejectUSB() { if (!this.usb)
        return; if (this.usb.phase !== 'complete' && this.usb.phase !== 'dumpComplete') {
        this.flash('Please wait...');
        return;
    } this.usb = null; this.reboot(); }
    setInput(i, high) {
        this.inputs[i] = high;
        const raw = String(this.config['I' + i]);
        const inverted = ['2', '4', '6', '8', '10', 'INI', 'DVI', 'BRI', 'AL1I', 'AL2I', 'AL3I'].includes(raw);
        const active = inverted ? !high : high;
        const emergency = ['1', '1A', '1B', '1C', '2', '3', '4', '9', '10'].includes(raw);
        if (emergency) {
            if (['9', '10'].includes(raw) && active) {
                this.inputOverride = this.inputOverride?.source === i ? null : { kind: 'emergency', type: raw, code: this.config.EC, source: i, latched: true };
            }
            else if (active)
                this.inputOverride = { kind: 'emergency', type: raw, code: this.config.EC, source: i, latched: ['1', '1A', '1B', '1C', '2'].includes(raw) };
            else if (this.inputOverride?.source === i && !this.inputOverride.latched)
                this.inputOverride = null;
        }
        if (['5', '6'].includes(raw)) {
            if (active)
                this.blankAt = null;
            else
                this.blankAt = Date.now() + Number(this.config.BT) * 60000;
        }
        if (['DV', 'DVI'].includes(raw) && active)
            this.flash('HANVOX: play twice (simulated)');
    }
    scheduledInfo(now) {
        const d = new Date(now + this.clockOffset);
        for (const s of Object.values(this.schedules)) {
            if (!s || !s.code)
                continue;
            const day = (d.getMonth() + 1) * 100 + d.getDate();
            const mins = d.getHours() * 60 + d.getMinutes();
            const range = (v, a, b) => a <= b ? v >= a && v <= b : v >= a || v <= b;
            const date = n => { const [x, y] = n.split('/').map(Number); return y * 100 + x; };
            const time = n => { const [x, y] = n.split(':').map(Number); return x * 60 + y; };
            if (range(day, date(s.startDate), date(s.endDate)) && range(mins, time(s.startTime), time(s.endTime)))
                return s.code;
        }
        return '';
    }
    activeInfo(now) { if (!this.config.IN)
        return ''; for (let i = 0; i < 3; i++) {
        const raw = String(this.config['I' + i]);
        if (raw === 'IN' && this.inputs[i] || raw === 'INI' && !this.inputs[i])
            return String(this.config.IC).padStart(2, '0');
    } return this.info || this.scheduledInfo(now); }
    tick(now = Date.now()) {
        if (this.mode === 'boot' && now > this.bootUntil)
            this.mode = 'normal';
        if (this.usb && ['loading', 'dump'].includes(this.usb.phase) && now - this.usb.since > 1300) {
            if (this.usb.phase === 'loading') {
                this.database = this.usb.data;
                if (this.database.config) {
                    for (const [k, v] of Object.entries(this.database.config))
                        if (Object.hasOwn(DEFAULT_CONFIG, k))
                            this.config[k] = v;
                }
                this.usb.phase = 'complete';
            }
            else
                this.usb.phase = 'dumpComplete';
        }
        if (this.mode === 'dump' && now - this.dumpStart > 10000) {
            this.returnMenu();
            this.flash('DUMP ABORTED');
        }
        if ((this.mode === 'entry' && !['usbLock', 'settingCode', 'settingText', 'clock'].includes(this.entry?.kind) || this.mode === 'browse' || this.mode === 'fields' && this.fieldKind === 'time') && now - this.lastInteraction >= 20000) {
            this.mode = 'normal';
            this.entry = null;
            this.browse = null;
        }
        if (this.mode === 'status' && this.quickReturn && now > this.statusUntil) {
            Object.assign(this, this.quickReturn);
            this.quickReturn = null;
        }
        if (this.countdownEnd && now >= this.countdownEnd) {
            this.countdownEnd = 0;
            if (String(this.config.CC).startsWith('I'))
                this.info = '';
        }
        if (this.notice && now > this.noticeUntil)
            this.notice = '';
    }
    displayText(now = Date.now()) {
        if (!this.power)
            return { lines: [], footer: '' };
        if (this.notice)
            return { lines: [this.notice], footer: '' };
        if (this.mode === 'boot')
            return { lines: ['HANOVER', this.bootKind === 'lock' ? 'Lock code reset: 0101' : this.bootKind === 'factory' ? 'Factory settings loaded' : 'DERIC-G3 V1.51.00', 'abcdeNCP012U4567//'], footer: '' };
        if (this.mode === 'usb')
            return { lines: ['USB:', this.usb.phase === 'loading' ? 'Found simulator database' : this.usb.phase === 'dump' ? 'Dumping...' : this.usb.phase === 'dumpComplete' ? 'Dump completed' : 'Load completed', this.usb.phase.includes('omplete') ? 'Remove USB drive:' : 'Please wait...'], footer: '' };
        if (this.mode === 'dump')
            return { lines: ['Insert USB drive:'], footer: '' };
        if (this.mode === 'confirm')
            return { lines: ['Save changes?', '', 'Yes ------- No'], footer: '' };
        if (this.mode === 'clockConfirm') {
            const d = new Date(now + this.pendingClock);
            return { lines: ['Confirm?', d.toLocaleDateString('en-GB') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' (' + timezoneText(this.pendingTimezone) + ')', 'Yes ------- No'], footer: '' };
        }
        if (this.mode === 'test')
            return { lines: ['Testing...'], footer: '' };
        if (this.mode === 'entry') {
            const e = this.entry;
            const multiline = e.kind === 'settingText';
            return { lines: multiline ? [e.label, e.buffer || '_'] : [e.label + ' ' + (e.buffer || '_'), '', this.entryPrevious(e.kind)], entry: { label: e.label, value: e.buffer || '_', cursor: e.cursor, previous: this.entryPrevious(e.kind), multiline }, footer: '' };
        }
        if (this.mode === 'browse') {
            const d = this.browse.list[this.browse.index];
            return { lines: [d.driver || [d.route, ...d.front].join(' '), '', `${this.config.RB ? 'Route ' + this.browse.route + '  ' : ''}${this.destinationCode(d)}`], footer: '' };
        }
        if (this.mode === 'fields')
            return this.fieldScreen();
        if (this.mode === 'menu')
            return this.menuDisplay(this.mainMenu());
        if (this.mode === 'settings') {
            const opts = this.groupOptions().map(([k, label]) => `${k} - ${label}  ${this.target()[k] ?? '-'}`);
            opts.push('Back');
            return this.menuDisplay(opts);
        }
        if (this.mode === 'edit')
            return { lines: [`${this.editOption[0]} - ${this.editOption[1]}`, String(this.editValue), 'F/E: select  LEFT: back'], footer: '' };
        if (this.mode === 'status') {
            const pages = [['DERIC-G3 V1.51.00 Ok', this.database.name, this.connected.map(x => x ? '0' : '4').join(' ') + ' . . . . .  ' + this.inputs.map(x => x ? '#' : '-').join('')], [`${JSON.stringify(this.database).length}  8.0Mb RTC`, 'SIMULATED DATABASE', new Date(now + this.clockOffset).toLocaleString('en-GB')], [`PF=${this.system.PF} (${this.database.name})`], ['1: L, 160 x 24 #0', '2: L, 96 x 16 #1', '3: L, 32 x 16 #2'], [`Network: ${this.network.UNIT_ID}`, `IP ${this.network.ENABLE_DHCP === '1' ? 'DHCP+' : 'static'} ${this.network.IP_ADDRESS}`, `FTP ${this.network.FTP_SERVER_IP}`], ['MAC: simulated interface', 'No physical network I/O', `Subnet ${this.network.SUBNET_MASK}`]];
            return { lines: pages[this.statusPage], footer: '' };
        }
        if (this.blankAt !== null && this.blankAt !== undefined && now >= this.blankAt)
            return { lines: ['************************', 'SIGNS BLANKED', '************************'], footer: '' };
        const d = this.current();
        let msg = this.database.destinations.length ? (this.badRoute ? 'Bad route' : d ? (d.driver || [d.route, ...d.front].join(' ')) : !this.dest || Number(this.dest) === 0 ? 'Idle' : this.config.QF ? this.dest : 'Bad destination') : 'NO DATA';
        if (d && this.config.RN && !this.config.RB && msg.startsWith(d.route + ' '))
            msg = this.route + ' ' + msg.slice(d.route.length + 1);
        if (String(this.config.DD) !== '*' && d) {
            const s = ['front', 'side', 'rear'][Number(this.config.DD)];
            if (s)
                msg = [d.route, ...d[s]].filter(Boolean).join('|');
        }
        if (String(this.config.DM).startsWith('T'))
            msg = new Date(now + this.clockOffset).toLocaleTimeString('en-GB', { hour12: String(this.config.DM).startsWith('T12') });
        const inf = this.activeInfo(now);
        const exists = this.database.information.some(m => m.code === inf);
        const info = inf ? (exists ? inf : '??') : '--';
        const ad = this.advert ? (this.database.adverts.some(m => m.code === this.advert) ? this.advert : '??') : '--';
        return { lines: msg.split('|').slice(0, this.config.DM === 0 ? 1 : 2), footer: `${info} ${ad}${this.connected.some(x => !x) ? ' *' : '  '}       ${this.config.RN || this.config.RB ? this.route + ' ' : ''}${String(this.dest || '----').padStart(this.config.DS, '0')}` };
    }
    menuDisplay(list) { const p = (this.index - 1 + list.length) % list.length, n = (this.index + 1) % list.length; return { lines: [list[p], list[this.index], list[n]], highlight: 1, footer: '' }; }
    fieldScreen() {
        const p = n => String(n).padStart(2, '0'), v = fieldValues(this.fields), field = this.fields[this.fieldIndex];
        if (this.fieldKind === 'clock') {
            if (this.fieldIndex < 3) {
                const values = [p(v.day), p(v.month), String(v.year)];
                return { lines: ['Date:', values.join('/'), ''], field: { text: values.join('/'), start: [0, 3, 6][this.fieldIndex], length: this.fieldIndex === 2 ? 4 : 2 }, footer: '' };
            }
            if (this.fieldIndex < 5) {
                const text = p(v.hour) + ':' + p(v.minute);
                return { lines: ['Time:', text, ''], field: { text, start: this.fieldIndex === 3 ? 0 : 3, length: 2 }, footer: '' };
            }
            return { lines: ['Timezone: (+/- UTC)', '[ ' + timezoneText(v.timezone) + ' ]', ''], field: { text: '[ ' + timezoneText(v.timezone) + ' ]', start: 2, length: timezoneText(v.timezone).length }, footer: '' };
        }
        if (this.fieldKind === 'time') {
            const text = p(v.hour) + ':' + p(v.minute);
            return { lines: ['Time:', text, ''], field: { text, start: this.fieldIndex === 0 ? 0 : 3, length: 2 }, footer: '' };
        }
        return { lines: [this.scheduleCode + ' - Timed Info', field.name + ': ' + p(field.value), 'F/E: next   LEFT: back'], footer: '' };
    }
    entryPrevious(kind) { if (kind === 'out')
        return this.out || '----'; if (kind === 'return')
        return this.returnDest || '----'; return this[kind] || ''; }
    signContent(side, now = Date.now()) {
        const idx = ['front', 'side', 'rear'].indexOf(side);
        if (!this.power || !this.connected[idx] || this.mode === 'boot' || this.signs['S' + idx] === '-' || this.ports.P0 !== 'SIGN')
            return { route: '', lines: [] };
        if (this.blankAt !== undefined && this.blankAt !== null && now >= this.blankAt)
            return { route: '', lines: [] };
        if (this.mode === 'test')
            return { test: true, address: this.testAddress, index: idx };
        let d = this.current();
        if (this.inputOverride)
            d = this.database.destinations.find(x => sameCode(x.code, this.inputOverride.code)) || d;
        for (let i = 0; i < 3; i++) {
            const raw = String(this.config['I' + i]);
            if (raw === 'BR' && this.inputs[i] || raw === 'BRI' && !this.inputs[i]) {
                const br = this.database.destinations.find(x => /^BR/.test(x.code));
                if (br?.[side]?.length)
                    d = br;
            }
        }
        const map = this.signs['S' + idx];
        const targetSide = typeof map === 'number' ? ['front', 'side', 'rear'][map] || side : side;
        let route = d ? (this.config.RN || this.config.RB ? this.route : d.route) : '';
        if (!this.config.RZ)
            route = route.replace(/^0+(?=.)/, '');
        let lines = d?.[targetSide] || [];
        if (d?.pages?.length) {
            const first = Number(this.config.T0) * 100;
            const other = Math.max(1, Number(this.config.T1) * 100);
            const cycle = first + other * (d.pages.length - 1);
            const t = (now - this.selectionAt) % cycle;
            const page = t < first ? 0 : 1 + Math.floor((t - first) / other);
            lines = d.pages[page]?.[targetSide] || lines;
        }
        if (!this.config.DN && !this.config.RB) {
            lines = [];
            route = this.route;
        }
        const inf = this.activeInfo(now);
        const info = this.database.information.find(m => m.code === inf);
        const showInfo = info && (d || [1, 11].includes(this.config.QG) || [2, 12].includes(this.config.QG) && String(this.config.BC) !== '0000');
        if (showInfo) {
            const destTime = (this.config.IPG === 'X' ? 1 : Math.max(1, Number(this.config.IPG) || 1)) * Number(this.config.T0) * 100;
            const infoTime = Number(this.config.T2) * 100;
            if ((now - this.selectionAt) % (destTime + infoTime) >= destTime)
                lines = [info.text];
        }
        if (!d && !showInfo && this.config.QF && this.dest)
            lines = [this.dest];
        const paste = text => { let t = String(text); if (this.config.TV === 1)
            t = t.replaceAll('~', this.fixedTime); if (this.config.TV === 2)
            t = t.replaceAll('~', String(Math.max(0, Math.ceil((this.countdownEnd - now) / 60000)))); if (this.config.TV === 3)
            t = t.replaceAll('~', new Date(now + this.clockOffset).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })); return t; };
        return { route, lines: lines.map(paste) };
    }
    remoteSelect(code, route = '') { if (!this.config.RM) {
        this.flash('Remote control disabled');
        return false;
    } if (this.localLatch || this.manual && this.config.RP === 0) {
        this.flash('Manual selection has priority');
        return false;
    } if (this.manual && this.config.RP === 2 && this.lastRemote && sameCode(code, this.lastRemote.dest) && (!route || sameCode(route, this.lastRemote.route)))
        return false; if (this.config.RP === 3 && (!code || Number(code) === 0))
        return false; if (route)
        this.route = route; this.chooseDestination(code, true); this.lastRemote = { dest: this.dest, route: this.route, info: this.info, advert: this.advert }; return true; }
}
