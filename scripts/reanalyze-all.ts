import "dotenv/config";
import { getOwnerUserId } from "../lib/owner";
import { reanalyzeAllForUser, refreshUserInsights } from "../lib/ai/jobs";
import { getUserAnalysisStats } from "../lib/db/queries";

async function main() {
  const uid = await getOwnerUserId();
  const n = await reanalyzeAllForUser(uid);
  console.log("Reanalyzed:", n);
  console.log("Stats:", await getUserAnalysisStats(uid));
  await refreshUserInsights(uid);
  console.log("Insights generated");
}

main().catch(console.error);
