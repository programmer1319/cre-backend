# CRE frontend Settings patch

Copy the contained `src/app` files over the matching paths in the Angular CRE frontend project. The new service is additive; the Settings component files replace the current static implementation.

The patch expects these authenticated backend routes:

- `GET /api/settings`
- `PATCH /api/settings`
- `PATCH /api/user/security/password`

No route or application configuration changes are required because both services are provided at root and the existing dashboard Settings route remains unchanged.
