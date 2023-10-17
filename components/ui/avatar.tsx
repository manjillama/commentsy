import { Session } from "next-auth";
import Image from "next/image";

export default function Avatar({ user }: { user?: Session["user"] }) {
  return (
    <div
      className="rounded-full h-[32px] w-[32px] flex items-center"
      style={
        user
          ? { backgroundColor: user.avatarBackgroundColor }
          : { backgroundColor: "#000" }
      }
    >
      {user ? (
        <div className="text-center w-full font-semibold">
          {user.name?.split("")[0]}
        </div>
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
