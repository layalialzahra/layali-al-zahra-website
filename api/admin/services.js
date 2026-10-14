import { createManagedContentHandler } from "../_lib/managed-content-routes.js";

// Explicit filesystem route: Vercel must resolve the admin Services API directly.
export default createManagedContentHandler("service", { admin: true });
