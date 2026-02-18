import { Client } from "ldapts";
import type { MentionItem, MentionQuery, MentionSource } from "../types";

type ActiveDirectoryConfig = {
  url: string;
  bindDN: string;
  bindPassword: string;
  baseDN: string;
  userFilter: string;
};

export class ActiveDirectoryUsersSource implements MentionSource {
  private readonly config: ActiveDirectoryConfig;

  constructor(config: ActiveDirectoryConfig) {
    this.config = config;
  }

  async search(query: MentionQuery): Promise<MentionItem[]> {
    const ldap = new Client({ url: this.config.url });
    const safeQuery = escapeLdapFilter(query.query.trim());

    const termFilter = safeQuery
      ? `(|(cn=*${safeQuery}*)(displayName=*${safeQuery}*)(mail=*${safeQuery}*)(sAMAccountName=*${safeQuery}*))`
      : "(objectClass=*)";
    const filter = `(&${this.config.userFilter}${termFilter})`;

    try {
      await ldap.bind(this.config.bindDN, this.config.bindPassword);

      const result = await ldap.search(this.config.baseDN, {
        scope: "sub",
        filter,
        sizeLimit: query.limit,
        attributes: ["objectGUID", "displayName", "cn", "mail", "title", "thumbnailPhoto"]
      });

      return result.searchEntries.slice(0, query.limit).map((entry: Record<string, unknown>) => {
        const displayName = stringValue(entry.displayName) || stringValue(entry.cn) || "Unknown";
        const email = stringValue(entry.mail);
        const description = stringValue(entry.title) || email;
        return {
          id: guidOrFallback(entry.objectGUID, displayName),
          displayName,
          description,
          link: email ? `mailto:${email}` : undefined
        };
      });
    } finally {
      await ldap.unbind().catch(() => undefined);
    }
  }
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function guidOrFallback(value: unknown, fallback: string): string {
  if (Buffer.isBuffer(value)) {
    return (value as Buffer).toString("hex");
  }
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  return fallback.toLowerCase().replace(/\s+/g, "-");
}

function escapeLdapFilter(input: string): string {
  return input
    .replace(/\\/g, "\\5c")
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\0/g, "\\00");
}
