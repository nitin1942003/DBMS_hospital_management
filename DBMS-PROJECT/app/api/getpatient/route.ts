import { NextResponse } from "next/server";
import { auth } from "@/auth";


export async function GET() {
    const session = await auth();
    console.log(session, 'session');
    return NextResponse.json(session, {status: 200});
}