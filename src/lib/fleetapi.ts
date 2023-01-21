import type { Session } from "next-auth/core/types";

type Notification = {
  notificationId: string;
  discordAccountId: string;
  createdAt: string;
  updatedAt: string;
  notificationMessage: string;
  expiresAt: string;
  serviceId: string;
  serviceNameIdentifier: string;
};

type fleetResponse =
  | ({
      success?: boolean;
      message?: string;
      code?: string;
      notifications?: Array<Notification>;
    } & Response)
  | undefined;

const FLEET_API_BASE_URL = process.env.FLEET_API_BASE_URL;
const FLEET_AUTH_TOKEN = process.env.FLEET_AUTH_TOKEN;
const SERVICE_ID = process.env.SERVICE_ID;
const SERVICE_NAME_IDENTIFIER = process.env.SERVICE_NAME_IDENTIFIER;

export const connectUsertoService = async (session: Session) => {
  let fleetResponse: fleetResponse;

  if (
    session &&
    FLEET_API_BASE_URL &&
    FLEET_AUTH_TOKEN &&
    SERVICE_ID &&
    SERVICE_NAME_IDENTIFIER
  ) {
    try {
      fleetResponse = await fetch(
        `${FLEET_API_BASE_URL}/fleet/service/connectuser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FLEET_AUTH_TOKEN}`,
          },
          body: JSON.stringify({
            discordAccountId: session?.user?.id,
            discordUsername: session?.user?.name,
            serviceId: SERVICE_ID,
            serviceNameIdentifier: SERVICE_NAME_IDENTIFIER,
          }),
        }
      );
    } catch (error) {
      console.error(error); // server-side log
    }
  } else {
    fleetResponse = undefined;
  }

  return fleetResponse;
};

export const getApiVersion = async (session: Session) => {
  let fleetResponse: fleetResponse;
  if (
    session &&
    FLEET_API_BASE_URL &&
    FLEET_AUTH_TOKEN &&
    SERVICE_ID &&
    SERVICE_NAME_IDENTIFIER
  ) {
    try {
      fleetResponse = await fetch(`${FLEET_API_BASE_URL}/fleet/version`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FLEET_AUTH_TOKEN}`,
        },
      });
    } catch (error) {
      console.error(error); // server-side log
    }
  } else {
    fleetResponse = undefined;
  }

  return fleetResponse;
};

export const getUserNotifications = async (session: Session) => {
  let fleetResponse: fleetResponse;
  if (
    session &&
    session.user &&
    FLEET_API_BASE_URL &&
    FLEET_AUTH_TOKEN &&
    SERVICE_ID &&
    SERVICE_NAME_IDENTIFIER
  ) {
    try {
      fleetResponse = await fetch(
        `${FLEET_API_BASE_URL}/fleet/notifications?discordAccountId=${session.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FLEET_AUTH_TOKEN}`,
          },
        }
      );
    } catch (error) {
      console.error(error); // server-side log
    }
  } else {
    fleetResponse = undefined;
  }

  return fleetResponse;
};
