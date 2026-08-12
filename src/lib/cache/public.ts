import { revalidateTag } from "next/cache";

export const PUBLIC_CMS_TAG = "public-cms";
export const MEMBER_COUNT_TAG = "member-count";

export function bustPublicCmsCache() {
  revalidateTag(PUBLIC_CMS_TAG);
}

export function bustMemberCountCache() {
  revalidateTag(MEMBER_COUNT_TAG);
}
