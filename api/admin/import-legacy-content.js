import { createLegacyImportHandler } from "../_lib/import-legacy-content.js";

// Explicit filesystem route for importing only legacy Services into the CMS.
export default createLegacyImportHandler();
