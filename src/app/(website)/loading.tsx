import { PageLoader } from "@/components/brand/page-loader";

/** Inline only — never cover the fixed header with a blocking overlay. */
export default function Loading() {
  return <PageLoader label="Loading…" />;
}
