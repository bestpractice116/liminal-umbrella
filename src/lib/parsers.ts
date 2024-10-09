export interface AGameSession {
    name: string;
    type: string;
    date: string;
    location: string;
    spaces_total: number;
    spaces_free: number;
    dm_contact: string;
    description: string;
}

const inputRe = new RegExp(/\s\s\s+/);
const nameRe = new RegExp(/(?:\*\*)?(?:Adventure [nN]ame|Game)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n*]*)/);
const typeRe = new RegExp(/(?:\*\*)?(?:Type of Adventure)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n*]*)/);
const dateRe = new RegExp(/(?:\*\*)?(?:(?:Start )?[dD]ate)\s*(?:\*\*)?:\s*(?:\*\*)?\s*(?:\w+day)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
const dmRe = new RegExp(/(?:\*\*)?(?:DM [cC]ontact|DM)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n*]*)/);
const locationRe = new RegExp(/(?:\*\*)?Location\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n*]*)/);
const spacesRe = new RegExp(/(?:\*\*)?Spaces [Cc]urrently [Aa]vailable\s*(?:\*\*)?:\s*(?:\*\*)?\s*(\d)(?:\/| of )(\d)/);
const descriptionRe = new RegExp(/(?:\*\*)?(?:Brief )?[Dd]escription\s*?(?:\*\*)?:?\s*?(?:\*\*)?\s*(.*)$/s);

export function parseAvailableGame(input: string): AGameSession {
    input = input.replace(inputRe, '\n');
    const out = {
        name: '??',
        type: '??',
        date: '??',
        location: '??',
        spaces_total: 0,
        spaces_free: 0,
        dm_contact: '??',
        description: '??'
    };
    const nameMatches = nameRe.exec(input);
    if (nameMatches) {
        out.name = nameMatches[1];
    }
    const typeMatches = typeRe.exec(input);
    if (typeMatches) {
        out.type = typeMatches[1];
    }
    const dateMatches = dateRe.exec(input);
    if (dateMatches) {
        out.date = dateMatches[1];
    }
    const dmMatches = dmRe.exec(input);
    if (dmMatches) {
        out.dm_contact = dmMatches[1];
    }
    const locationMatches = locationRe.exec(input);
    if (locationMatches) {
        out.location = locationMatches[1];
    }
    const spacesMatches = spacesRe.exec(input);
    if (spacesMatches) {
        out.spaces_free = parseInt(spacesMatches[1]);
        out.spaces_total = parseInt(spacesMatches[2]);
    }
    const descriptionMatches = descriptionRe.exec(input);
    if (descriptionMatches) {
        out.description = descriptionMatches[1].trim();
    }
    return out;
}
