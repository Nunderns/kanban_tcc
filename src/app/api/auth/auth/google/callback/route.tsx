// src/app/api/auth/google/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("/login");
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", null, {
      params: {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/api/auth/google/callback",
        grant_type: "authorization_code",
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token } = tokenRes.data;

    const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const user = userRes.data;
    console.log("Usuário logado via Google:", user);


    return NextResponse.redirect("/dashboard");
  } catch (error) {
    console.error("Erro no login Google:", error);
    return NextResponse.redirect("/login");
  }
}
