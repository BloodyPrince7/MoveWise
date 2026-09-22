import { GoogleGenAI } from "@google/genai";
import { AgentResearchResponse, ScoredNeighborhood, UserConstraints, CustomRequirement } from "@/types/relocation";
import { calculateNeighborhoodScore } from "./scoring";
import { attachCustomAmenities } from "./generator";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export interface RefinementResult {
  updatedConstraints: UserConstraints;
  updatedNeighborhoods: ScoredNeighborhood[];
  agentResponse: string;
  changeSummary: string[];
}

export async function processFollowUpRefinement(
  currentResponse: AgentResearchResponse,
  userMessage: string,
  apiKey?: string
): Promise<RefinementResult> {
  const currentConstraints = { ...currentResponse.userConstraints };
  const lowerMsg = userMessage.toLowerCase();
  const changeSummary: string[] = [];

  let updatedConstraints: UserConstraints = {
    ...currentConstraints,
    customRequirements: currentConstraints.customRequirements ? [...currentConstraints.customRequirements] : [],
  };
  let geminiExplanation = "";

  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const prompt = `You are MoveWise AI Relocation Agent.
The user wants to refine their relocation constraints with this message: "${userMessage}".
Current constraints: ${JSON.stringify(currentConstraints)}

Analyze whether the user is modifying budget, commute, gym, transit, or adding/removing custom requirements (like school, hospital, daycare, pet park, coworking, etc.).
Output strict JSON with this schema:
{
  "budgetMonthlyInr": number (or null if unchanged),
  "gymRequired": boolean (or null if unchanged),
  "maxCommuteMin": number (or null if unchanged),
  "transitPreference": string (or null if unchanged),
  "addCustomRequirements": [
    {
      "category": "school" | "hospital" | "daycare" | "pet_park" | "coworking" | "sports" | "other",
      "label": string,
      "targetDistanceKm": number,
      "isEssential": boolean
    }
  ] (or empty array if none),
  "removeCustomRequirementCategories": string[] (e.g. ["school"] or empty array if none),
  "explanation": string (brief friendly explanation of how the recommendations adapted)
}
Only output valid JSON.`;

      let outputText = "";
      try {
        const genPromise = ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: prompt,
          config: { temperature: 0.1 },
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini refine timed out")), 4000)
        );
        const res: any = await Promise.race([genPromise, timeoutPromise]);
        outputText = res.text || "";
      } catch {
        // Fallback to fast heuristic rules below
      }

      const cleanJson = outputText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      if (parsed.budgetMonthlyInr) {
        updatedConstraints.budgetMonthlyInr = parsed.budgetMonthlyInr;
        changeSummary.push(`Adjusted monthly budget to ₹${(parsed.budgetMonthlyInr / 1000).toFixed(0)}k`);
      }
      if (typeof parsed.gymRequired === "boolean") {
        updatedConstraints.gymRequired = parsed.gymRequired;
        changeSummary.push(parsed.gymRequired ? "Prioritized gym proximity" : "Removed gym requirement");
      }
      if (parsed.maxCommuteMin) {
        updatedConstraints.maxCommuteMin = parsed.maxCommuteMin;
        changeSummary.push(`Updated max commute time to ${parsed.maxCommuteMin} mins`);
      }
      if (parsed.transitPreference) {
        updatedConstraints.transitPreference = parsed.transitPreference;
      }

      if (Array.isArray(parsed.removeCustomRequirementCategories) && parsed.removeCustomRequirementCategories.length > 0) {
        parsed.removeCustomRequirementCategories.forEach((catToRemove: string) => {
          const cat = catToRemove.toLowerCase();
          updatedConstraints.customRequirements = (updatedConstraints.customRequirements || []).filter(
            (r) => r.category.toLowerCase() !== cat
          );
          changeSummary.push(`Removed ${cat} requirement`);
        });
      }

      if (Array.isArray(parsed.addCustomRequirements) && parsed.addCustomRequirements.length > 0) {
        parsed.addCustomRequirements.forEach((req: any) => {
          const cat = (req.category || "other").toLowerCase();
          // Filter out existing requirement for same category if any
          updatedConstraints.customRequirements = (updatedConstraints.customRequirements || []).filter(
            (r) => r.category.toLowerCase() !== cat
          );
          updatedConstraints.customRequirements.push({
            id: req.id || `req-${cat}-${Date.now()}`,
            category: cat,
            label: req.label || cat,
            targetDistanceKm: Number(req.targetDistanceKm) || 1.5,
            priority: req.priority || "essential",
          });
          changeSummary.push(`Added requirement: ${req.label || cat} within ${req.targetDistanceKm || 1.5} km`);
        });
      }

      if (parsed.explanation) {
        geminiExplanation = parsed.explanation;
      }
    } catch (e: any) {
      console.warn("[Gemini:RefineFallback] Heuristic parsing refinement:", e.message);
    }
  }

  // Fallback heuristic rules
  if (changeSummary.length === 0) {
    // Check budget
    if (lowerMsg.includes("30k") || lowerMsg.includes("30,000") || lowerMsg.includes("30000")) {
      updatedConstraints.budgetMonthlyInr = 30000;
      changeSummary.push("Increased monthly housing budget to ₹30,000");
    } else if (lowerMsg.includes("20k") || lowerMsg.includes("20,000") || lowerMsg.includes("cheaper")) {
      updatedConstraints.budgetMonthlyInr = Math.max(18000, updatedConstraints.budgetMonthlyInr - 5000);
      changeSummary.push(`Adjusted budget toward cheaper options (~₹${(updatedConstraints.budgetMonthlyInr / 1000).toFixed(0)}k)`);
    } else if (lowerMsg.includes("35k") || lowerMsg.includes("35,000")) {
      updatedConstraints.budgetMonthlyInr = 35000;
      changeSummary.push("Increased monthly housing budget to ₹35,000");
    }

    // Check gym
    if (lowerMsg.includes("don't care about gym") || lowerMsg.includes("no gym") || lowerMsg.includes("ignore gym") || lowerMsg.includes("skip gym")) {
      updatedConstraints.gymRequired = false;
      changeSummary.push("Removed gym requirement from scoring weights");
    } else if (lowerMsg.includes("need gym") || lowerMsg.includes("gym is important")) {
      updatedConstraints.gymRequired = true;
      changeSummary.push("Re-activated gym proximity as an essential requirement");
    }

    // Check metro / transit
    if (lowerMsg.includes("closer to metro") || lowerMsg.includes("metro station") || lowerMsg.includes("near metro")) {
      updatedConstraints.transitPreference = "metro_priority";
      changeSummary.push("Elevated metro proximity priority");
    }

    // Commute
    if (lowerMsg.includes("20 min") || lowerMsg.includes("20min") || lowerMsg.includes("under 20")) {
      updatedConstraints.maxCommuteMin = 20;
      changeSummary.push("Tightened maximum commute target to 20 minutes");
    }

    // Check custom requirements removal
    const removalKeywords = ["remove school", "no school", "skip school", "don't need school", "without school"];
    if (removalKeywords.some((kw) => lowerMsg.includes(kw))) {
      updatedConstraints.customRequirements = (updatedConstraints.customRequirements || []).filter(
        (r) => r.category.toLowerCase() !== "school"
      );
      changeSummary.push("Removed school requirement");
    }

    const removeHospital = ["remove hospital", "no hospital", "skip hospital", "don't need hospital"];
    if (removeHospital.some((kw) => lowerMsg.includes(kw))) {
      updatedConstraints.customRequirements = (updatedConstraints.customRequirements || []).filter(
        (r) => r.category.toLowerCase() !== "hospital"
      );
      changeSummary.push("Removed hospital requirement");
    }

    // Check dynamic custom requirements addition / update
    // Pattern: [category] [distance] km or [distance] km [category]
    const customCategories: { category: any; label: string; defaultDist: number; keywords: string[] }[] = [
      { category: "school", label: "School", defaultDist: 1.0, keywords: ["school", "schools", "k-12", "cbse", "icse", "international school"] },
      { category: "hospital", label: "Hospital", defaultDist: 2.0, keywords: ["hospital", "hospitals", "clinic", "emergency", "healthcare"] },
      { category: "daycare", label: "Daycare", defaultDist: 1.5, keywords: ["daycare", "day care", "crèche", "creche", "preschool"] },
      { category: "pet_park", label: "Pet Park", defaultDist: 2.0, keywords: ["pet park", "dog park", "pets", "pet friendly"] },
      { category: "coworking", label: "Coworking Space", defaultDist: 2.0, keywords: ["coworking", "co-working", "work cafe"] },
      { category: "sports", label: "Sports Facility", defaultDist: 2.0, keywords: ["sports", "badminton", "swimming", "turf", "tennis"] },
    ];

    for (const item of customCategories) {
      const isMentioned = item.keywords.some((kw) => lowerMsg.includes(kw));
      // Make sure it's not a removal request
      const isRemoval = lowerMsg.includes(`no ${item.category}`) || lowerMsg.includes(`remove ${item.category}`) || lowerMsg.includes(`skip ${item.category}`);
      if (isMentioned && !isRemoval) {
        // Try to extract distance (e.g. "school nearby 1km", "school within 1 km", "1.5 km", "under 2km")
        const distRegex = new RegExp(`(?:${item.keywords.join("|")})[\\s\\S]{0,25}?(?:within|under|nearby|less than)?\\s*(\\d+(?:\\.\\d+)?)\\s*(?:km|kms|kilometer|kilometres)?`, "i");
        const reverseDistRegex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:km|kms|kilometer|kilometres)?[\\s\\S]{0,15}?(?:${item.keywords.join("|")})`, "i");

        let targetDist = item.defaultDist;
        const match = lowerMsg.match(distRegex) || lowerMsg.match(reverseDistRegex);
        if (match && match[1]) {
          const parsedNum = parseFloat(match[1]);
          if (!isNaN(parsedNum) && parsedNum > 0 && parsedNum <= 20) {
            targetDist = parsedNum;
          }
        }

        // Add or update custom requirement
        updatedConstraints.customRequirements = (updatedConstraints.customRequirements || []).filter(
          (r) => r.category.toLowerCase() !== item.category
        );
        updatedConstraints.customRequirements.push({
          id: `req-${item.category}-${Date.now()}`,
          category: item.category,
          label: item.label,
          targetDistanceKm: targetDist,
          priority: "essential",
        });
        changeSummary.push(`Prioritizing ${item.label} within ${targetDist} km`);
      }
    }
  }

  // Refresh neighborhood data with attached custom amenities
  const rawNeighborhoods = currentResponse.neighborhoods.map((n) => n.data);
  const refreshedNeighborhoods = attachCustomAmenities(rawNeighborhoods, updatedConstraints);

  // Re-calculate scores for all neighborhoods
  const updatedNeighborhoods: ScoredNeighborhood[] = refreshedNeighborhoods
    .map((data) => {
      const newScore = calculateNeighborhoodScore(data, updatedConstraints);
      return {
        data,
        score: newScore,
      };
    })
    .sort((a, b) => b.score.overallScore - a.score.overallScore);

  const topArea = updatedNeighborhoods[0];
  const summaryText = changeSummary.length > 0 ? changeSummary.join("; ") : "Preferences updated";
  const agentResponse =
    geminiExplanation ||
    `Updated your preferences (${summaryText}). **${topArea.data.name}** is now your top recommendation (${topArea.score.overallScore}/100 match).`;

  return {
    updatedConstraints,
    updatedNeighborhoods,
    agentResponse,
    changeSummary,
  };
}

