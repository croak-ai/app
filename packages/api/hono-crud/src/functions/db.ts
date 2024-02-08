import { HonoContext } from "../config";

export const getDbAuthToken = ({
  c,
  groupName,
}: {
  c: HonoContext;
  groupName: string;
}) => {
  const env = c.env.DB_ENVIORNMENT_LEVEL;

  if (!groupName.startsWith(env)) {
    throw new Error(
      "You are trying to access a database that is not in your environment",
    );
  }

  const location = groupName.slice(env.length + 1).toUpperCase();

  return c.env[`${location}_SECRET` as keyof typeof c.env];
};
