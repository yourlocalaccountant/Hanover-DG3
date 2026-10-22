export const MANUAL = 'https://storage.e.jimdo.com/file/894a57b5-ef0b-4d75-97cb-6a1695fbfefc/DG3%20Destination%20Controller.pdf';
export const DEFAULT_CONFIG = {
    AL: 0, AM: 0, AN: 0, BCA: 0, BI: 1, BR: 0, BT: 0, BL: 0, CB: 0, DD: '*', DI: 0, DLN: 0, DAV: 0, DM: 1,
    DN: 1, DS: 4, HA: 0, HDM: 1, HI: 0, HT1: 10, I0: '7', I1: '-', I2: '-', IN: 1, IP: '0', IPG: '0', RB: 0,
    RL: 4, RM: 0, RN: 0, RP: 0, RS: '*', RSD: '*', RSR: '*', RSI: '*', RSA: '*', RT: 0, RZ: 0, SPY: 0,
    T0: 30, T1: 30, T2: 30, T3: 30, TV: 0, WD: 0, WA: 0, ZW: 0, ZY: 0, QF: 0, QG: 0, SXP: 0, MPSX: 1,
    EC: '9999', IC: '01', CC: '0001', BC: '0000', BCS: '0000',
};
export const DEFAULT_SYSTEM = { AS: 57600, DA: 1, DP: 1, EBN: 1, KL: 30, UP: 'Enabled', LC: '0101', LG: 'EN', PF: 0, SS: 4800, SST: 100, TU: 0, ZZ: 0 };
const bool = [0, 1];
export const CONFIG_OPTIONS = [
    ['AL', 'Advertising Signs', [0, 1, 2, 3, 4]], ['AM', 'Auto/Man menu', bool], ['AN', 'Prompt for Ad Num', bool], ['BCA', 'Battery Charge Auto', bool], ['BI', 'Browse to Idle', [0, 1, 2]], ['BR', 'Destination Browser', bool],
    ['BT', 'Blanking Timer', 0, 100], ['BL', 'Blanking Level', 0, 100], ['CB', 'Confirm Browse', bool], ['DD', "Driver's Display", ['*', 0, 1, 2, 3, 4, 5, 6, 7]], ['DI', 'Drivers ID', [0, 1, 2, 3, 4, 5]], ['DLN', 'De Lijn Mode', [0, 1, 2]], ['DAV', 'De Lijn AVL', bool], ['DM', 'Display Mode', [0, 1, 2, 'T', 'T12', 'T12S', 'T24', 'T24S']], ['DN', 'Prompt for Dest Num', bool], ['DS', 'Destination Code Size', [3, 4, 5, 6]], ['HA', 'Hide Adverts', bool], ['HDM', 'HTC Driver menu', bool], ['HI', 'Hide Information', bool], ['HT1', 'HTC Timer 1', 0, 100],
    ...['I0', 'I1', 'I2'].map((x, i) => [x, `Ext Input ${i}`, ['-', '1', '1A', '1B', '1C', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'IN', 'INI', 'DV', 'DVI', 'BR', 'BRI', 'AL1', 'AL1I', 'AL2', 'AL2I', 'AL3', 'AL3I']]),
    ['IN', 'Prompt for Info Num', bool], ['IP', 'Ext IP INFO mode', ['0', '1', '2', '3', '4', '5', '6', '7', '8', 'X']], ['IPG', 'Global INFO mode', ['0', '1', '2', '3', '4', '5', '6', '7', '8', 'X']], ['RB', 'Route Browse', bool], ['RL', 'Route No Len', [3, 4, 5, 6, 7]], ['RM', 'Remote Enable', bool], ['RN', 'Route Number', bool], ['RP', 'Remote Priority', [0, 1, 2, 3, 4]],
    ...['RS', 'RSD', 'RSR', 'RSI', 'RSA'].map((x, i) => [x, ['Reset Settings', 'Reset Dest', 'Reset Route', 'Reset Info', 'Reset Advert'][i], ['*', 0, 1, 2]]),
    ['RT', 'Round Trip', bool], ['RZ', 'Route Zeros allow', bool], ['SPY', 'Slow proxy', bool], ...['T0', 'T1', 'T2', 'T3'].map((x, i) => [x, `Timer ${i}`, i === 3 ? 0 : 10, 3000]), ['TV', 'Time Entry', [0, 1, 2, 3]], ['WD', 'Wayfarer Device No', 0, 15], ['WA', 'Wayfarer Address No', 0, 15], ['ZW', 'ZW browse mode', bool], ['ZY', 'ZY HTC', bool], ['QF', 'Bad dest as text', bool], ['QG', 'INFO behaviour', [0, 1, 2, 10, 11, 12]], ['SXP', 'SuperX Info Paste', bool], ['MPSX', 'SuperX Multi Page', bool],
    ...Array.from({ length: 8 }, (_, i) => [`Q${i + 1}`, `Timed Info ${i + 1}`, 'schedule']),
];
export const SYSTEM_OPTIONS = [
    ['AS', 'Auto Speed', [2400, 4800, 9600, 19200, 38400, 57600, 115200]], ['DA', 'Daylight Saving', bool], ['DP', 'Date pos.', [1, 2]], ['EBN', 'enable USB ERIC.BIN', bool], ['KL', 'Key Illumination', 0, 100], ['UP', 'USB Power', ['Enabled', 'Disabled', 1, 2, 3, 4, 5]], ['LC', 'Lock Code', 'code'], ['LG', 'Language', ['DA', 'EN', 'FI', 'FR', 'DE', 'HE', 'ID', 'IT', 'PT', 'ES', 'SV', 'NO', 'RO', 'TR', 'ZH', 'NL']], ['PF', 'Profile', 0, 99], ['SS', 'Sign Speed', ['AUTO', 4800, 9600, 19200, 38400]], ['SST', 'Status Timeout', 100, 1900, 50], ['TU', 'Timed Update', bool], ['ZZ', 'Factory Code', 0, 99],
];
export const PROTOCOLS = ['-', 'SIGN', 'DIAG', 'SOCRIE-A', 'SOCRIE-B', 'GTMH-1', 'HANO-1', 'HANO-1F', 'HANO-2', 'HANO-2F', 'ISR-1', 'INIT-TCRA', 'VDV-IBIS', 'IBIS-2', 'IBIS-3', 'IBIS-4', 'IBIS-5', 'IBIS-6', 'IBIS-WL', 'IBIS-BE', 'IBIS-ACT', 'KIRCHHEIM-IBIS', 'FREIBURG-IBIS', 'KOR-1', 'KOR-2', 'KOR-3', 'KOR-4', 'AACHEN-IBIS', 'IBIS-VMX', 'IBIS-ARR', 'IBIS-ALMERE', 'IBIS-HBG1', 'IBIS-HBG2', 'IBIS-LTA', 'HANVOX', 'TGX150-A', 'TGX150-D', 'PRODAT-A', 'ERG-A', 'ERG-B', 'ERG-C', 'MONET-A', 'MONET-B', 'SYSECA-A', 'SLE', 'NYCT', 'OCTA', 'J1708-3', 'J1708-2', 'J1708-2A', 'J1708-1', 'J1708-5', 'SEMA', 'SEREL', 'RGLIT', 'BKB232', 'BKBCORUNA', 'HANAUTO', 'AESYS-A', 'CAN-BCS', 'CAN-BCS-1', 'CAN-BCS-2', 'CAN-BCS-2A', 'IVNUPLOAD'];
export const DEFAULT_NETWORK = { 'CLIENT SERVER': '1', ENABLE_DHCP: '1', 'TCP_UDP ENABLED': '1', IP_ADDRESS: '10.0.0.1', SUBNET_MASK: '255.255.0.0', DEFAULT_GATEWAY: '10.0.0.10', DNS_SERVER: '10.0.0.50', 'CONFIG PORT': '13010', FTP_PORT: '21', FTP_SERVER_IP: '10.0.254.254', FTP_SERVER_USER_NAME: 'hanover', FTP_SERVER_PASSWORD: '', FTP_SERVER_DELAY_WAIT: '30', UDP1_IP: '255.255.255.255', UDP1_PORT: '13010', UDP2_IP: '255.255.255.255', UDP2_PORT: '13010', TCP1_IP: '10.0.0.10', TCP1_PORT: '13010', TCP1_SERV: '0', TCP2_IP: '10.0.0.10', TCP2_PORT: '13010', TCP2_SERV: '0', UNIT_ID: 'DG3SIM', CTRL_LOADING_ROUTEDEST: '-1|-1', FTP_WIFI_MAN: '1', PAYLOAD_PATH1: '', PAYLOAD_PATH2: '', PAYLOAD_PATH3: '', PAYLOAD_PATH4: '', FTP_LOCK_ACTIVE: '0', FTP_DEBUG: '0', FTPSERVER_MANIFEST_DIR: '/vehicle/', FTPSERVER_PAYLOAD_DIR: '/new/', FTPSERVER_LOG_DIR: '/log/', FTP_MANDANTFILE: 'mandant.csv', FTP_LOCKFILELOCK: 'Lock', FTP_LOCKFILEUNLOCK: 'LockNone', BUS_PROFILE_NUM_RESET: '0', ENABLE_TFTP: '0' };
export function sampleDatabase() {
    return { format: 'dg3-simulator-v1', name: 'Manual examples', destinations: [
            { code: '0014', route: '73A', driver: '73A BROWNFORD', front: ['BROWNFORD'], side: ['BROWNFORD'], rear: [] },
            { code: '0023', route: '382', driver: '382 LION GREEN|VIA TOWN CENTRE', front: ['LION GREEN', 'VIA TOWN CENTRE'], side: ['LION GREEN', 'VIA TOWN CENTRE'], rear: [] },
            { code: '0001', route: '10', driver: '10 TOWN CENTRE', front: ['TOWN CENTRE'], side: ['TOWN CENTRE'], rear: [] },
            { code: '0002', route: '10', driver: '10 RAILWAY STATION', front: ['RAILWAY STATION'], side: ['RAILWAY STATION'], rear: [] },
            { code: '0003', route: '25', driver: '25 AIRPORT|VIA STATION', front: ['AIRPORT', 'VIA STATION'], side: ['AIRPORT', 'VIA STATION'], rear: [] },
            { code: '0004', route: '', driver: 'NOT IN SERVICE', front: ['NOT IN SERVICE'], side: ['NOT IN SERVICE'], rear: ['NOT IN', 'SERVICE'] },
            { code: '9999', route: '', driver: '', front: ['EMERGENCY', 'CALL POLICE'], side: ['EMERGENCY', 'CALL POLICE'], rear: ['CALL', 'POLICE'] },
            { code: 'BR01', route: '', driver: 'BUS REVERSING', front: [], side: ['BUS REVERSING'], rear: ['BUS', 'REVERSING'] },
        ], information: [{ code: '01', text: 'BUS FULL' }, { code: '32', text: 'MERRY XMAS!' }, { code: '02', text: 'NO EVENING SERVICE TODAY' }], adverts: [{ code: '19', text: 'WELCOME ABOARD' }] };
}
export function validateDatabase(input) {
    if (!input || !Array.isArray(input.destinations) || input.destinations.length > 10000)
        throw new Error('Expected a simulator JSON database containing a destinations array (maximum 10,000 entries).');
    const used = new Set();
    const destinations = input.destinations.map((d, i) => {
        const code = String(d.code ?? '').trim().toUpperCase();
        if (!/^[A-Z0-9]{1,10}$/.test(code))
            throw new Error(`Destination ${i + 1}: code must contain 1 to 10 letters or digits.`);
        const key = code.replace(/^0+/, '') || '0';
        if (used.has(key))
            throw new Error(`Duplicate destination code ${code}.`);
        used.add(key);
        const out = { code, route: String(d.route ?? '').slice(0, 7), driver: String(d.driver ?? '').slice(0, 160) };
        for (const side of ['front', 'side', 'rear']) {
            if (!Array.isArray(d[side]) || d[side].some(x => typeof x !== 'string' || x.length > 160) || d[side].length > 8)
                throw new Error(`${code}: ${side} must be an array of up to 8 text lines.`);
            out[side] = d[side];
        }
        if (Array.isArray(d.pages)) {
            out.pages = d.pages.slice(0, 8).map(p => { const page = {}; for (const s of ['front', 'side', 'rear'])
                page[s] = Array.isArray(p[s]) ? p[s].slice(0, 2).map(x => String(x).slice(0, 160)) : out[s]; return page; });
        }
        return out;
    });
    const messages = (list, label) => { if (list !== undefined && !Array.isArray(list))
        throw new Error(`${label} must be an array.`); const ids = new Set(); return (list || []).map(m => { const code = String(m.code).padStart(2, '0'); if (!/^\d{2}$/.test(code) || ids.has(code))
        throw new Error(`Invalid or duplicate ${label} code ${code}.`); ids.add(code); return { code, text: String(m.text ?? '').slice(0, 160) }; }); };
    const config = {};
    if (input.config !== undefined) {
        if (!input.config || typeof input.config !== 'object' || Array.isArray(input.config))
            throw new Error('Configuration must be an object.');
        for (const [k, v] of Object.entries(input.config)) {
            if (!Object.hasOwn(DEFAULT_CONFIG, k))
                throw new Error(`Unsupported configuration parameter ${k}.`);
            const option = CONFIG_OPTIONS.find(x => x[0] === k);
            if (Array.isArray(option?.[2])) {
                const value = option[2].find(x => String(x) === String(v));
                if (value === undefined)
                    throw new Error(`Invalid value for ${k}.`);
                config[k] = value;
            }
            else if (typeof option?.[2] === 'number') {
                if (!Number.isFinite(Number(v)) || Number(v) < option[2] || Number(v) > option[3])
                    throw new Error(`Invalid range for ${k}.`);
                config[k] = Number(v);
            }
            else {
                if (!/^[A-Z0-9]{1,10}$/.test(String(v)))
                    throw new Error(`Invalid code for ${k}.`);
                config[k] = String(v);
            }
        }
    }
    return { format: 'dg3-simulator-v1', name: String(input.name || 'USB database').slice(0, 40), destinations, information: messages(input.information, 'information'), adverts: messages(input.adverts, 'advert'), ...(input.config !== undefined ? { config } : {}) };
}
