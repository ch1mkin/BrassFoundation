import { NextResponse } from "next/server";
import { getLiveMemberCount } from "@/lib/membership/member-count";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public live member count for homepage polling. */
export async function GET() {
  try {
    const count = await getLiveMemberCount();
    return NextResponse.json(
      { count },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
