// env is an any because we want to allow both Hono and Cloudflare environment variables to work.
export const getDbAuthToken = ({
  env,
  groupName,
}: {
  env: any;
  groupName: string;
}) => {
  const enviornmentLevel = env.DB_ENVIORNMENT_LEVEL;

  if (!groupName.startsWith(enviornmentLevel)) {
    throw new Error(
      "You are trying to access a database that is not in your environment",
    );
  }

  const location = groupName.slice(enviornmentLevel.length + 1).toUpperCase();

  return env[`${location}_SECRET`];
};
