import { GoogleGenAI } from "@google/genai";
import { UserConstraints, CustomRequirement } from "@/types/relocation";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

/**
 * Parses freeform natural language text to extract structured relocation constraints
 * AND dynamic custom requirements (e.g. "school nearby 1km", "hospital within 2km", "dog park", "coworking").
 */
export async function extractConstraintsFromPrompt(
  prompt: string,
  apiKey?: string
): Promise<Partial<UserConstraints>> {
  const geminiKey = apiKey || process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const model = DEFAULT_GEMINI_MODEL;

      const systemPrompt = `You are MoveWise AI Relocation Agent parser. 
Extract structured constraints from the user's natural language relocation query into strict JSON format.
CRITICAL: If the user mentions ANY specific local requirement like schools (e.g. "school nearby 1km"), hospitals, pet parks, daycares, sports/badminton, coworking spaces, lakes, etc., extract them into the "customRequirements" array with appropriate category, label, and targetDistanceKm.

Target schema:
{
  "city": string (e.g. "Bangalore"),
  "officeLocation": string (e.g. "Whitefield"),
  "salaryLpa": number or null,
  "budgetMonthlyInr": number (e.g. 25000),
  "maxCommuteMin": number (e.g. 30),
  "accommodationType": "1BHK" | "2BHK" | "1RK" | "Coliving" | "Any",
  "furnishedPreference": "furnished" | "semi-furnished" | "unfurnished" | "any",
  "gymRequired": boolean,
  "maxGymDistKm": number,
  "foodPreference": "diverse" | "vegetarian" | "budget_friendly" | "cafes" | "any",
  "transitPreference": "metro_priority" | "bus_ok" | "cab_commute" | "walkable",
  "groceryPreference": "instant_delivery" | "walkable_supermarket" | "any",
  "customRequirements": [
    {
      "id": string (e.g. "req-school"),
      "category": string (e.g. "school", "hospital", "daycare", "pet_park", "coworking", "sports"),
      "label": string (e.g. "Schools & Education", "Hospitals", "Daycare / Preschool"),
      "targetDistanceKm": number (e.g. 1.0),
      "priority": "essential" | "preferred"
    }
  ],
  "additionalNotes": string
}`;

      let outputText = "";
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${systemPrompt}\n\nUser request: "${prompt}"`,
          config: {
            temperature: 0.1,
          },
        });
        outputText = response.text || "";
      } catch (genErr) {
        const interaction = await ai.interactions.create({
          model,
          input: `${systemPrompt}\n\nUser request: "${prompt}"`,
        });
        outputText = interaction.output_text || "";
      }

      const cleanJson = outputText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err: any) {
      console.warn("[Gemini:ExtractionFallback] Using dynamic heuristic parser:", err.message);
    }
  }

  return extractHeuristicsFromPrompt(prompt);
}

/**
 * Intelligent regex and keyword heuristic extractor supporting dynamic custom parameters.
 */
export function extractHeuristicsFromPrompt(prompt: string): Partial<UserConstraints> {
  const text = prompt.toLowerCase();
  const constraints: Partial<UserConstraints> = {};
  const customRequirements: CustomRequirement[] = [];

  // City extraction
  if (text.includes("bangalore") || text.includes("bengaluru")) {
    constraints.city = "Bangalore";
  } else if (text.includes("hyderabad")) {
    constraints.city = "Hyderabad";
  } else if (text.includes("pune")) {
    constraints.city = "Pune";
  } else if (text.includes("gurgaon") || text.includes("delhi") || text.includes("noida")) {
    constraints.city = "Gurgaon";
  } else if (text.includes("mumbai")) {
    constraints.city = "Mumbai";
  } else {
    constraints.city = "Bangalore";
  }

  // Office Location
  if (text.includes("whitefield")) {
    constraints.officeLocation = "Whitefield";
  } else if (text.includes("bellandur") || text.includes("ecospace")) {
    constraints.officeLocation = "Bellandur";
  } else if (text.includes("hitec") || text.includes("cyberabad")) {
    constraints.officeLocation = "Hitec City";
  } else if (text.includes("hinjawadi") || text.includes("hinjewadi")) {
    constraints.officeLocation = "Hinjawadi";
  } else if (text.includes("bkc") || text.includes("bandra kurla")) {
    constraints.officeLocation = "BKC";
  } else if (text.includes("cyber city") || text.includes("cyber hub")) {
    constraints.officeLocation = "Cyber City";
  } else {
    // Attempt to extract office anchor pattern: "job in [Location]" or "office in [Location]"
    const officeMatch = text.match(/(?:office|job|workplace|company)\s+(?:in|at|near)\s+([a-zA-Z\s]{3,20})/i);
    if (officeMatch && officeMatch[1]) {
      constraints.officeLocation = officeMatch[1].trim();
    } else {
      constraints.officeLocation = "Whitefield";
    }
  }

  // Budget extraction (e.g. "25000", "25k", "₹25,000", "30k", "40k")
  const kMatch = text.match(/(\d+)\s*k\b/);
  const fullNumMatch = text.match(/(\d{2})[,\s]*000/);
  if (kMatch) {
    const kVal = parseInt(kMatch[1], 10);
    if (kVal >= 10 && kVal <= 150) {
      constraints.budgetMonthlyInr = kVal * 1000;
    }
  } else if (fullNumMatch) {
    constraints.budgetMonthlyInr = parseInt(fullNumMatch[1], 10) * 1000;
  } else {
    constraints.budgetMonthlyInr = 25000;
  }

  // Commute (e.g. "under 30 minutes", "30 min", "20 mins")
  const commuteMatch = text.match(/(\d+)\s*(?:min|minute|minutes)/i);
  if (commuteMatch) {
    constraints.maxCommuteMin = parseInt(commuteMatch[1], 10);
  } else {
    constraints.maxCommuteMin = 30;
  }

  // Gym requirement
  if (text.includes("gym") || text.includes("fitness")) {
    constraints.gymRequired = true;
    const gymDistMatch = text.match(/(?:gym[^\d]*)(\d+(?:\.\d+)?)\s*(?:km|k\.m\.|kms)/i) ||
                         text.match(/(\d+(?:\.\d+)?)\s*(?:km|kms)\s*(?:of|from)?\s*gym/i);
    if (gymDistMatch) {
      constraints.maxGymDistKm = parseFloat(gymDistMatch[1]);
    } else {
      constraints.maxGymDistKm = 2;
    }
  } else {
    constraints.gymRequired = false;
  }

  // Accommodation type
  if (text.includes("2bhk") || text.includes("2 bhk")) {
    constraints.accommodationType = "2BHK";
  } else if (text.includes("1rk") || text.includes("1 rk")) {
    constraints.accommodationType = "1RK";
  } else if (text.includes("coliving") || text.includes("pg")) {
    constraints.accommodationType = "Coliving";
  } else {
    constraints.accommodationType = "1BHK";
  }

  // Furnished
  if (text.includes("unfurnished")) {
    constraints.furnishedPreference = "unfurnished";
  } else if (text.includes("semi-furnished") || text.includes("semi furnished")) {
    constraints.furnishedPreference = "semi-furnished";
  } else {
    constraints.furnishedPreference = "furnished";
  }

  // ==========================================
  // DYNAMIC CUSTOM PARAMETER EXTRACTION
  // ==========================================

  // 1. School / Education extraction (e.g. "school nearby 1km", "school within 2 km")
  if (text.includes("school") || text.includes("education") || text.includes("kindergarten")) {
    const schoolDistMatch = text.match(/(?:school[^\d]*)(\d+(?:\.\d+)?)\s*(?:km|kilometer|k\.m\.|kms)/i) ||
                            text.match(/(\d+(?:\.\d+)?)\s*(?:km|kilometer|kms)\s*(?:of|from|to)?\s*school/i);
    const dist = schoolDistMatch ? parseFloat(schoolDistMatch[1]) : 1.5;
    customRequirements.push({
      id: "req-school",
      category: "school",
      label: "Schools & Education",
      targetDistanceKm: dist,
      queryKeyword: "schools",
      priority: "essential",
    });
  }

  // 2. Hospital / Healthcare extraction
  if (text.includes("hospital") || text.includes("clinic") || text.includes("healthcare") || text.includes("doctor")) {
    const hospDistMatch = text.match(/(?:hospital[^\d]*)(\d+(?:\.\d+)?)\s*(?:km|kilometer|kms)/i);
    const dist = hospDistMatch ? parseFloat(hospDistMatch[1]) : 2.0;
    customRequirements.push({
      id: "req-hospital",
      category: "hospital",
      label: "Hospitals & Healthcare",
      targetDistanceKm: dist,
      queryKeyword: "hospitals",
      priority: "essential",
    });
  }

  // 3. Daycare / Preschool
  if (text.includes("daycare") || text.includes("preschool") || text.includes("creche")) {
    const distMatch = text.match(/(?:daycare|preschool)[^\d]*(\d+(?:\.\d+)?)\s*(?:km|m|kms)/i);
    const dist = distMatch ? parseFloat(distMatch[1]) : 1.0;
    customRequirements.push({
      id: "req-daycare",
      category: "daycare",
      label: "Daycare & Preschool",
      targetDistanceKm: dist,
      queryKeyword: "daycare preschool",
      priority: "essential",
    });
  }

  // 4. Pet / Dog Park
  if (text.includes("pet") || text.includes("dog park") || text.includes("dog-friendly")) {
    customRequirements.push({
      id: "req-pet-park",
      category: "pet_park",
      label: "Pet Friendly & Dog Parks",
      targetDistanceKm: 2.0,
      queryKeyword: "dog park pet park",
      priority: "preferred",
    });
  }

  // 5. Coworking space
  if (text.includes("coworking") || text.includes("wework") || text.includes("work cafe")) {
    customRequirements.push({
      id: "req-coworking",
      category: "coworking",
      label: "Coworking Spaces",
      targetDistanceKm: 1.5,
      queryKeyword: "coworking space",
      priority: "preferred",
    });
  }

  // 6. Sports / Badminton / Swimming
  if (text.includes("badminton") || text.includes("swimming") || text.includes("tennis") || text.includes("sports")) {
    customRequirements.push({
      id: "req-sports",
      category: "sports",
      label: "Sports & Badminton Courts",
      targetDistanceKm: 2.0,
      queryKeyword: "badminton court sports complex",
      priority: "preferred",
    });
  }

  constraints.foodPreference = text.includes("veg") ? "vegetarian" : "diverse";
  constraints.transitPreference = text.includes("metro") ? "metro_priority" : "bus_ok";
  constraints.groceryPreference = "walkable_supermarket";
  constraints.customRequirements = customRequirements;
  constraints.additionalNotes = prompt;

  return constraints;
}
