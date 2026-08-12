import { PageLoader } from "@/components/brand/page-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <PageLoader label="Loading…" />
    </div>
  );
}
