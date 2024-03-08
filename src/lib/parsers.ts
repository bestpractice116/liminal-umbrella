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

export function parseAvailableGame(input: string) : AGameSession {
  // **Adventure Name**: Restom Adventure Guild Entertainment - Graduation!
  // **Adventure name**: Unhappy Birthday
  const re = new RegExp(/(?:\*\*)?(?:Adventure [nN]ame|Game)\s*(?:\*\*)?:\s*(?:\*\*)?\s*([^\n\*]*)/);
  console.log();
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
  const matches = input.match(re);
  if (matches) {
    out["name"] = matches[1];
  }
  return out;
}
