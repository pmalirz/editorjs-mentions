# Example Server Modes

The sample mentions REST server supports two modes:

- Default: in-memory users (`AD_ENABLED=false`)
- Optional: LDAP/AD-backed users (`AD_ENABLED=true`)

## Default Mode (In-Memory)

By default, server uses fixed in-memory example users from:

- `examples/server/src/providers/in-memory-users.ts`

Run:

```bash
npm run dev:server
```

If `examples/server/.env` does not enable LDAP (`AD_ENABLED=false`), endpoint:

`GET http://localhost:3001/api/mentions/users?query=jo&trigger=@&limit=8`

returns static demo users.

## API Specification

The mention plugin expects a standardized REST response. While this example uses `/api/mentions/users`, your endpoint can be named anything and can return any type of entity (users, tags, projects, etc.).

### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `query` | `string` | The search term entered by the user (after the trigger). |
| `trigger` | `string` | The character that triggered the mention (e.g., `@`, `#`). |
| `limit` | `number` | Maximum number of items to return (default: 8). |

### Response Schema

The endpoint must return an object with an `items` array:

```json
{
  "items": [
    {
      "id": "unique-id-123",
      "displayName": "John Doe",
      "description": "Software Engineer",
      "image": "https://example.com/avatar.png",
      "link": "https://profile.example.com/johndoe"
    }
  ]
}
```

**Model Fields:**

- `id`: (Required) Unique identifier to be stored in the editor data.
- `displayName`: (Required) Primary text shown in the suggestions list.
- `description`: (Optional) Secondary text/sub-label for the item.
- `image`: (Optional) URL for the thumbnail/avatar.
- `link`: (Optional) URL used to wrap the mention in the saved content.

## LDAP Mode (Optional)

This folder includes a local LDAP stack for testing AD/LDAP provider.

### Start LDAP

```bash
docker compose -f examples/server/docker-compose.ldap.yml up -d
```

LDAP services:

- LDAP: `ldap://localhost:1389`
- LDAP seed job: `ldap-seed` (loads `examples/server/ldap/seed/10-users.ldif`)
- phpLDAPadmin UI: `http://localhost:8081`

phpLDAPadmin login:

- Login DN: `cn=admin,dc=example,dc=local`
- Password: `admin`

### Configure mention server to use LDAP

1. Copy env:

```powershell
Copy-Item examples/server/.env.ldap.example examples/server/.env
```

2. Start sample REST server:

```bash
npm run dev:server
```

3. Query endpoint:

`GET http://localhost:3001/api/mentions/users?query=jo&trigger=@&limit=8`

Expected matches include `John Doe` and `Joanna Smith`.

### Seeded LDAP users

Seed data is in `examples/server/ldap/seed/10-users.ldif`.

- `John Doe`
- `Joanna Smith`
- `Raj Patel`

Note: seed file is mounted read-only and should not be removed by container startup.

### Stop LDAP

```bash
docker compose -f examples/server/docker-compose.ldap.yml down
```
