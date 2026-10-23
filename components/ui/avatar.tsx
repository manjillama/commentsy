import { Session } from "next-auth";
import Image from "next/image";

export default function Avatar({
  user,
  size,
}: {
  user?: Session["user"];
  size?: "sm";
}) {
  const style = size === "sm" ? { transform: "scale(0.9)" } : {};
  const userStyle = user
    ? { backgroundColor: user.avatarBackgroundColor }
    : { backgroundColor: "#000" };
  return (
    <div
      className="rounded-full text-black h-[32px] w-[32px] flex items-center"
      style={{ ...userStyle, ...style }}
    >
      {user ? (
        user.image ? (
          <Image
            height={100}
            width={100}
            src={user.image}
            alt="User"
            className="rounded-full"
          />
        ) : (
          <div className="text-center w-full font-semibold">
            {user.name?.split("")[0]}
          </div>
        )
      ) : (
        <Image
          height={18}
          width={18}
          src="/commentsy-white.svg"
          alt="User"
          className="mx-auto"
        />
      )}
    </div>
  );
}
