import type { Session } from "next-auth/core/types";

type fleetResponse =
  | ({
      success?: boolean;
      message?: string;
      code?: string;
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
    fleetResponse = await fetch(`${FLEET_API_BASE_URL}/fleet/version`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${FLEET_AUTH_TOKEN}`,
      },
    });
  } else {
    fleetResponse = undefined;
  }

  return fleetResponse;
};
