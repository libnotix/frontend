import { redirect } from "next/navigation";

/** Legacy URL after creating a class; keep redirect so bookmarks/old bundles still work. */
export default function ClassListLegacyRedirect() {
  redirect("/dashboard/classes");
}
