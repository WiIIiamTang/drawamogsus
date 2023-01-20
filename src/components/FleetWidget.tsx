"use client";
import Image from "next/image";
import billbotlogo from "../assets/billbotlogo.png";
import ship from "../assets/ship-line.svg";
import { useState } from "react";
import type { Session } from "next-auth/core/types";
import Link from "next/link";

type FleetWidgetProps = {
  session?: Session | null;
  connected?: boolean | undefined;
  version?: string | undefined;
};

function FleetWidget({ session, connected, version }: FleetWidgetProps) {
  const [showWidget, setShowWidget] = useState(false);

  const handleClickLogo = () => {
    setShowWidget(!showWidget);
  };

  if (!session) return null;
  return (
    <>
      <div
        className={`fixed ${
          showWidget
            ? "h-64 w-64 px-4 py-4 max-w-xs opacity-75 text-opacity-100"
            : "px-0 py-0 h-0 w-0 opacity-0 text-opacity-0"
        } transition-all backdrop-blur-sm shadow-lg duration-500 ease-in-out bottom-0 right-0 z-40 bg-slate-100 rounded-3xl border-sky-900 border-2 mr-2 mb-2`}
      >
        <div className="flex h-full w-full break-before-auto text-xs flex-col flex-wrap justify-center items-center">
          {showWidget &&
            (connected ? (
              <div
                className={`flex flex-col justify-center items-center ${
                  showWidget ? "visible" : "hidden"
                } h-1/2 w-full`}
              >
                <h2 className="font-semibold text-md text-sky-900">
                  Hi {session.user?.name}
                </h2>
                <div>
                  <Image src={ship} alt="ship" className="w-14 h-14" />
                </div>
                <div className="mt-auto">
                  <p>No notifications.</p>
                </div>
              </div>
            ) : (
              <div>
                Unable to connect to the fleet network - try again later.
              </div>
            ))}
          <div className="mt-auto text-xs text-slate-600 flex flex-row items-center gap-2 w-full">
            <p>{version && `${version}`}</p>
            {/* <p>
              <Link href="https://fleet.williamtang.me">
                fleet.williamtang.me
              </Link>
            </p> */}
          </div>
        </div>
      </div>
      <div
        onClick={handleClickLogo}
        className={`fixed cursor-pointer ${
          !showWidget && "hover:border-white hover:bg-slate-600"
        } transition-all duration-500 ease-in-out bottom-0 right-0 z-50 bg-slate-700 rounded-full border-sky-900 border mr-2 mb-2`}
      >
        <Image
          src={billbotlogo}
          alt="billbot-fleet logo"
          className="w-14 h-14 px-1 py-1"
        />
      </div>
    </>
  );
}

export default FleetWidget;
