export type AGameSession = {
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  spaces_total: number;
  spaces_free: number;
  dm_contact: string;
  description: string;
};

const inputRe = new RegExp(/\s\s\s+/);
const nameRe = new RegExp(/(?:\*\*)?(?:Adventure [nN]ame|Game)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n\*]*)/);
const typeRe = new RegExp(/(?:\*\*)?(?:Type of Adventure)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n\*]*)/);
const dateRe = new RegExp(/(?:\*\*)?(?:(?:Start )?[dD]ate)\s*(?:\*\*)?:\s*(?:\*\*)?\s*(?:\w+day)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/);
const dmRe = new RegExp(/(?:\*\*)?(?:DM [cC]ontact|DM)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n\*]*)/);


export function parseAvailableGame(input: string) : AGameSession {
  input = input.replace(inputRe, "\n");
  const out = {
    name: "??",
    type: "??",
    date: "??",
    time: "??",
    location: "??",
    spaces_total: 0,
    spaces_free: 0,
    dm_contact: "??",
    description: "??",
  };
  const nameMatches = input.match(nameRe);
  if (nameMatches) {
    out["name"] = nameMatches[1];
  }
  const typeMatches = input.match(typeRe);
  if (typeMatches) {
    out["type"] = typeMatches[1];
  }
  const dateMatches = input.match(dateRe);
  if (dateMatches) {
    out["date"] = dateMatches[1];
  }
  const dmMatches = input.match(dmRe);
  if (dmMatches) {
    out["dm_contact"] = dmMatches[1];
  }
  return out;
}
