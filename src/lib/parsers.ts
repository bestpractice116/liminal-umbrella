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

export function parseAvailableGame(_: string) : AGameSession {
  return {
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
}
