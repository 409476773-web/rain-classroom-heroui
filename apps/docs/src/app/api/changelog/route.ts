import type {NextRequest} from "next/server";

import {NextResponse} from "next/server";

import {env} from "~env";

export async function POST(request: NextRequest) {
  if (env.NEXT_PUBLIC_LOCAL_PREVIEW) {
    return NextResponse.json(
      {error: "Subscriptions are disabled in local preview."},
      {status: 503},
    );
  }

  try {
    const {email} = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({error: "Please enter a valid email."}, {status: 400});
    }

    const apiKey = process.env["FEATUREBASE_API_KEY"];
    const apiEndpoint = process.env["FEATUREBASE_API_ENDPOINT"] || "https://do.featurebase.app/v2";

    if (!apiKey) {
      console.error("FEATUREBASE_API_KEY is not configured");

      return NextResponse.json({error: "Featurebase service is not configured."}, {status: 500});
    }

    const response = await fetch(`${apiEndpoint}/changelog/subscribers`, {
      body: JSON.stringify({
        emails: [email],
      }),
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": `${apiKey}`,
      },
      method: "POST",
    });

    const res = await response.json();

    return NextResponse.json({success: res.success});
  } catch (error) {
    console.error("Featurebase subscription error:", error);

    return NextResponse.json({error: "Something went wrong. Please try again."}, {status: 500});
  }
}
