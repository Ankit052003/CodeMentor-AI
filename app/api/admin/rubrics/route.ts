import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

const CreateRubricSchema = z.object({
  categoryCode: z.enum(["BUG", "STYLE", "COMPLEXITY", "SECURITY", "BEST_PRACTICE"]),
  name: z.string().min(1).max(200),
  guidance: z.string().min(1),
  minScore: z.number().int().min(0).max(100),
  maxScore: z.number().int().min(0).max(100),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rubrics = await prisma.reviewRubric.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ rubrics });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateRubricSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const category = await prisma.reviewCategory.findUnique({
    where: { code: parsed.data.categoryCode },
  });

  if (!category) {
    return NextResponse.json({ error: "Review category not found" }, { status: 404 });
  }

  const rubric = await prisma.reviewRubric.create({
    data: {
      categoryId: category.id,
      name: parsed.data.name,
      guidance: parsed.data.guidance,
      minScore: parsed.data.minScore,
      maxScore: parsed.data.maxScore,
    },
    include: { category: true },
  });

  return NextResponse.json({ rubric }, { status: 201 });
}
