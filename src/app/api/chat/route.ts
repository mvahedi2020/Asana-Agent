import { NextResponse } from "next/server";

const SYSTEM = `You are an AI project management agent connected to Asana. You help a PM manage a SaaS B2B eCommerce project with ~100 tasks.

When the user asks about tasks, simulate realistic Asana data for a B2B SaaS eCommerce product. Include realistic task names, assignees, priorities, due dates, and statuses.

Always respond as if you have live access to Asana. Be concise but insightful. Format responses cleanly. When listing tasks use short structured lists. When giving recommendations, act like a senior PM consultant.

Key project details to simulate:
- Project: "B2B Commerce Platform v2.0"
- Team: Alex (Frontend), Sam (Backend), Jordan (QA), Priya (Design), Chris (DevOps)
- Sprints: Sprint 14 active, Sprint 15 planning
- Categories: Authentication, Checkout, Catalog, Integrations, Performance, Admin

Always end with a proactive suggestion or question to keep momentum.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: SYSTEM,
        messages,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
