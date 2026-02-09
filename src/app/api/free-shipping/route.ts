import { NextResponse } from "next/server";
import { getFreeShippingThreshold } from "@/lib/magento/freeShipping";

export async function GET() {
  const threshold = await getFreeShippingThreshold();
  return NextResponse.json({ threshold });
}
