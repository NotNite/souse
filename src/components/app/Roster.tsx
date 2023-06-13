import { useRosterStore } from "@/lib/stores/roster";
import { roster } from "@/styles/app.css";
import Avatar from "./Avatar";
import { useNavigate } from "react-router";

export default function Roster() {
  const rosterEntries = useRosterStore((state) => state.entries);
  const navigate = useNavigate();

  return (
    <div className={roster}>
      {rosterEntries.map((entry) => (
        <Avatar
          key={entry.jid}
          name={entry.name ?? entry.jid}
          avatar={entry.avatar}
          onClick={() => {
            navigate(`/conversations/${entry.jid}`);
          }}
        />
      ))}
    </div>
  );
}
