# Example LDAP Setup (Docker)

This folder includes a local LDAP stack for testing the AD/LDAP mention provider.

## Start LDAP

```bash
docker compose -f examples/server/docker-compose.ldap.yml up -d
```

Services:

- LDAP: `ldap://localhost:1389`
- LDAP seed job: `ldap-seed` (loads `examples/server/ldap/seed/10-users.ldif`)
- phpLDAPadmin UI: `http://localhost:8081`

phpLDAPadmin login:

- Login DN: `cn=admin,dc=example,dc=local`
- Password: `admin`

## Configure mention server to use LDAP

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

## Seeded LDAP users

Seed data is in `examples/server/ldap/seed/10-users.ldif`.

- `John Doe`
- `Joanna Smith`
- `Raj Patel`

Note: seed file is mounted read-only and should not be removed by container startup.

## Stop LDAP

```bash
docker compose -f examples/server/docker-compose.ldap.yml down
```
