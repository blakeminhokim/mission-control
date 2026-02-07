import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get session status which includes token usage
    const { stdout } = await execAsync("openclaw status --json 2>/dev/null || echo '{}'");
    
    let usage = {
      todayTokens: 0,
      todayCost: 0,
      sessions: 0,
    };

    try {
      const data = JSON.parse(stdout);
      if (data.usage) {
        usage = {
          todayTokens: data.usage.totalTokens || 0,
          todayCost: data.usage.cost?.total || 0,
          sessions: data.sessions?.length || 0,
        };
      }
    } catch {
      // Parse error, return defaults
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Failed to get usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
