import { useCacheStore } from "@/lib/stores/cache";
import { RosterEntry } from "@/lib/types";
import { avatar as avatarStyle, avatarText } from "@/styles/app.css";
import { noInteract } from "@/styles/text.css";
import { v3 } from "murmurhash";
import React, { HTMLAttributes } from "react";

type AvatarProps = HTMLAttributes<HTMLDivElement | HTMLImageElement>;
export default function Avatar(
  props: AvatarProps & {
    avatar?: string;
    name: string;
  }
) {
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const cacheStore = useCacheStore();

  React.useEffect(() => {
    (async () => {
      if (props.avatar != null) {
        const bytes = await cacheStore.readFile(`avatars/${props.avatar}`);
        setAvatar(URL.createObjectURL(new Blob([bytes])));
      }
    })();
  }, []);

  const propsWithoutEntry: AvatarProps & {
    avatar?: string;
    name?: string;
  } = { ...props };
  delete propsWithoutEntry.avatar;
  delete propsWithoutEntry.name;

  if (avatar != null) {
    return (
      <img
        className={avatarStyle}
        src={avatar}
        alt={props.name}
        {...propsWithoutEntry}
      />
    );
  } else if (props.avatar != null) {
    // We have an avatar, but not the content of it, so we're probably still fetching it
    // Don't hurt the user's eyes and flash it
    return <div className={avatarStyle} {...propsWithoutEntry}></div>;
  }

  const hash = v3(props.name);

  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  };

  const [r, g, b] = hslToRgb(hash, 50, 50);

  return (
    <div
      className={avatarStyle}
      style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
      {...propsWithoutEntry}
    >
      <span className={avatarText}>{props.name[0].toUpperCase()}</span>
    </div>
  );
}
