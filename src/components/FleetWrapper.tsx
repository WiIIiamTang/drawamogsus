import Auth from "@/components/Auth";
import FleetWidget from "@/components/FleetWidget";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {
  connectUsertoService,
  getApiVersion,
  getUserNotifications,
} from "@/lib/fleetapi";

type fleetResponse =
  | ({
      success?: boolean;
      message?: string;
      code?: string;
    } & Response)
  | undefined;

type fleetResponses = {
  [key: string]: fleetResponse;
};

const FleetWrapper = async ({ children }: { children: React.ReactNode }) => {
  const session = await unstable_getServerSession(authOptions);

  // Connect user to fleet
  let fleetResponses: fleetResponses = {};
  if (session) {
    fleetResponses.connected = await connectUsertoService(session);
    fleetResponses.version = await getApiVersion(session);
    fleetResponses.notifications = await getUserNotifications(session);
  }

  const fleetResponseConnectedJson =
    (await fleetResponses.connected?.json()) || undefined;

  const fleetResponseVersionJson =
    (await fleetResponses.version?.json()) || undefined;

  const fleetResponseNotificationsJson =
    (await fleetResponses.notifications?.json()) || undefined;

  return (
    <div>
      <Auth session={session} connected={fleetResponseConnectedJson?.success} />
      {children}
      <FleetWidget
        session={session}
        connected={fleetResponseConnectedJson?.success}
        version={fleetResponseVersionJson?.version}
        notifications={fleetResponseNotificationsJson?.notifications}
      />
    </div>
  );
};

export default FleetWrapper;
