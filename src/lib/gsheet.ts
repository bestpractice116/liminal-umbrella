import {google, sheets_v4} from 'googleapis';
import {GoogleAuth} from 'google-auth-library';

export class GSheet {
    auth: GoogleAuth;
    public sheets: sheets_v4.Sheets;

    constructor() {
        if (!process.env.GOOGLE_SERVICE_CREDENTIALS) {
            throw new Error("Environment variable 'GOOGLE_SERVICE_CREDENTIALS' is not defined");
        }
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_CREDENTIALS!);
        const auth = new GoogleAuth({credentials: creds, scopes: ['https://www.googleapis.com/auth/spreadsheets']});
        this.auth = auth;
        this.sheets = google.sheets({version: 'v4', auth, http2: true});
    }
}

type MemberFilter = (el: MemberSheetRow, idx: number) => boolean;

export class MemberSheet {
    api: GSheet
    public spreadsheet_id: string;
    members: MemberSheetRow[];

    constructor() {
        this.api = new GSheet();
        if (!process.env.GOOGLE_MEMBER_SPREADSHEET_ID) {
            throw new Error("Environment variable 'GOOGLE_MEMBER_SPREADSHEET_ID' is not defined");
        }
        this.spreadsheet_id = process.env.GOOGLE_MEMBER_SPREADSHEET_ID;
        this.members = [];
    }

    async fetch() {
        if (this.members.length > 0) {
            return this.members;
        }
        const res = await this.api.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheet_id,
            range: 'Membership List!A2:M',
        });
        const rows = res.data.values;
        if (!rows || rows.length === 0) {
            throw new Error('No data found.');
        }
        for (const row of rows) {
            if (!row[0] || row[0] == "" || row[0] == "Total Members") {
                continue;
            }
            this.members.push(new MemberSheetRow(row[0], row[1], `${row[2]}` == "1", row[3]))
        }
        return this.members;
    }

    async filter(f: MemberFilter) {
        return this.fetch().then(res => res.filter(f));
    }

    async findName(name: string) : Promise<MemberSheetRow | void> {
        const members = await this.filter((el: MemberSheetRow, _: number): boolean => {return el.name == name});
        if (members.length == 0) {
            return;
        }
        return members[0];
    }

    async count() : Promise<number> {
        return this.fetch().then(res => res.length);
    }
}

export function FilterAdminIs(name: string) {
    return function(el: MemberSheetRow, _: number): boolean {
       return el.admin == name;
    }
}

export function FilterRoleIs(name: string) {
    return function(el: MemberSheetRow, _: number): boolean {
        return el.role == name;
     }
}

export function FilterExists(el: MemberSheetRow, _: number) {
    return el.exists;
}

export class MemberSheetRow {
    public name: string;
    public role: string;
    public exists: boolean;
    public admin: string;

    constructor(name: string, role: string, exists: boolean, admin: string) {
        this.name = name;
        this.role = role;
        this.exists = exists;
        this.admin = admin;
        //console.log(`Construct spreadsheet member ${name} with ${role} exists ${exists} admin ${admin}`);
    }
}
