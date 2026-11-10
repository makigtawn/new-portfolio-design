import contentFile from "../../../content/site.json";
import { parseSiteContent, type SiteContent } from "./schema";

export function getSiteContent(): SiteContent {
  return parseSiteContent(JSON.stringify(contentFile));
}
