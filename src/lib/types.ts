export type RosterEntry = {
  jid: string;
  name: string | null;
  subscription: string;
  groups: string[];
  vcard?: string;
  avatar?: string;
};
