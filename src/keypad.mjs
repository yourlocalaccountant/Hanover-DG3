export class Keypad {
    constructor(controller, now = () => Date.now()) {
        this.controller = controller;
        this.now = now;
        this.held = new Map();
        this.enterConsumed = false;
        this.resetWindowUntil = 0;
    }
    press(key) {
        if (this.held.has(key))
            return;
        const now = this.now();
        this.held.set(key, { at: now, repeatAt: now + 450 });
        if (key === 'fe')
            this.enterConsumed = false;
        if (now < this.resetWindowUntil && this.held.has('up')) {
            if (this.held.has('left'))
                return this.reset('lock');
            if (this.held.has('fe'))
                return this.reset('factory');
        }
        if (['fe', 'left', 'down'].every(k => this.held.has(k))) {
            this.controller.reboot();
            this.resetWindowUntil = now + 3000;
            this.controller.bootUntil = this.resetWindowUntil;
            this.enterConsumed = true;
            return;
        }
        if (key !== 'fe')
            this.controller.key(key);
    }
    release(key) {
        if (!this.held.has(key))
            return;
        this.held.delete(key);
        if (key === 'fe' && !this.enterConsumed)
            this.controller.key('fe');
    }
    reset(kind) {
        this.controller.reboot(kind);
        this.enterConsumed = true;
        this.resetWindowUntil = 0;
    }
    power() {
        const kind = this.held.has('up') && this.held.has('fe') ? 'factory'
            : this.held.has('up') && this.held.has('left') ? 'lock' : 'normal';
        this.controller.togglePower(kind);
        this.enterConsumed = true;
    }
    advance() {
        const now = this.now();
        const enter = this.held.get('fe');
        if (enter && !this.enterConsumed && now - enter.at >= 3000) {
            this.controller.showStatus();
            this.enterConsumed = true;
        }
        if (this.controller.mode === 'boot')
            return;
        for (const key of ['up', 'down']) {
            const held = this.held.get(key);
            if (held && now >= held.repeatAt) {
                this.controller.key(key);
                held.repeatAt = now + 100;
            }
        }
    }
    cancel() { this.held.clear(); this.enterConsumed = true; }
}
