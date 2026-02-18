import dotenv from "dotenv";
import { createApp } from "./app";
import { ActiveDirectoryUsersSource } from "./providers/active-directory-users";
import { InMemoryUsersSource } from "./providers/in-memory-users";
import type { MentionSource } from "./types";

dotenv.config();

const port = Number(process.env.PORT || 3001);
const source = resolveSource();
const app = createApp(source);

app.listen(port, () => {
  process.stdout.write(`editorjs-mentions sample server listening on http://localhost:${port}\n`);
});

function resolveSource(): MentionSource {
  const useAd = process.env.AD_ENABLED?.toLowerCase() === "true";
  if (!useAd) {
    return new InMemoryUsersSource();
  }

  const url = process.env.AD_URL;
  const bindDN = process.env.AD_BIND_DN;
  const bindPassword = process.env.AD_BIND_PASSWORD;
  const baseDN = process.env.AD_BASE_DN;
  const userFilter = process.env.AD_USER_FILTER || "(objectClass=user)";

  if (!url || !bindDN || !bindPassword || !baseDN) {
    throw new Error("Active Directory is enabled but one or more AD_* environment variables are missing.");
  }

  return new ActiveDirectoryUsersSource({
    url,
    bindDN,
    bindPassword,
    baseDN,
    userFilter
  });
}

