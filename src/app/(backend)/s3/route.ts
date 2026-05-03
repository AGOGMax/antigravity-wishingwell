import { NextRequest, NextResponse } from "next/server";
import tokensData from "../../../../public/static/mining_tokenlist.json";
import era1Data from "../../../../public/static/ERA1/output.prod.json";
import era2Data from "../../../../public/static/ERA2/output.prod.json";

// AWS S3 decommissioned 2026-05-03. Data archived locally in public/static/.
export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file");

  switch (file) {
    case "tokens":
      return NextResponse.json({ data: { tokens: (tokensData as any).tokens ?? null, era1: null, era2: null } });
    case "era1":
      return NextResponse.json({ data: { tokens: null, era1: era1Data ?? null, era2: null } });
    case "era2":
      return NextResponse.json({ data: { tokens: null, era1: null, era2: era2Data ?? null } });
    default:
      return NextResponse.json({
        data: {
          tokens: (tokensData as any).tokens ?? null,
          era1: era1Data ?? null,
          era2: era2Data ?? null,
        },
      });
  }
}
