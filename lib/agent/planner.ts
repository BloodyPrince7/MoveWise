import { AgentStep, UserConstraints } from "@/types/relocation";

export interface ResearchPlan {
  planId: string;
  userConstraints: UserConstraints;
  candidateLocalities: string[];
  steps: AgentStep[];
}

export function createRelocationResearchPlan(constraints: UserConstraints): ResearchPlan {
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const office = constraints.officeLocation || "Whitefield";

  const steps: AgentStep[] = [
    {
      id: "step-constraints",
      label: "Understanding your requirements",
      detail: `Parsed target: ${constraints.city}, Office: ${office}, Budget: ₹${(constraints.budgetMonthlyInr / 1000).toFixed(0)}k, Commute < ${constraints.maxCommuteMin}m`,
      status: "idle",
      queryCount: 0,
    },
    {
      id: "step-neighborhoods",
      label: `Finding suitable candidate areas around ${office}`,
      detail: `Dynamically mapping residential localities within commute corridor of ${office}`,
      status: "idle",
      queryCount: 1,
    },
    {
      id: "step-housing",
      label: "Researching local housing & rent ranges",
      detail: `Searching market rental benchmarks for ${constraints.accommodationType} units via SerpApi Google Search`,
      status: "idle",
      queryCount: 4,
    },
    {
      id: "step-commute",
      label: "Checking commute options & peak travel times",
      detail: "Evaluating road congestion, public transit routes, and rapid metro connectivity",
      status: "idle",
      queryCount: 4,
    },
  ];

  if (constraints.gymRequired) {
    steps.push({
      id: "step-gyms",
      label: `Searching gyms within ${constraints.maxGymDistKm} km`,
      detail: "Querying Google Maps / Local Places for rated fitness studios, Cult.fit, and gyms",
      status: "idle",
      queryCount: 4,
    });
  }

  // Dynamically insert research steps for ANY custom requirements specified by user!
  if (constraints.customRequirements && constraints.customRequirements.length > 0) {
    constraints.customRequirements.forEach((cr) => {
      steps.push({
        id: `step-custom-${cr.category}`,
        label: `Searching ${cr.label.toLowerCase()} within ${cr.targetDistanceKm} km`,
        detail: `Scanning Google Maps for verified ${cr.label.toLowerCase()} matching your ${cr.targetDistanceKm} km distance threshold`,
        status: "idle",
        queryCount: 4,
      });
    });
  }

  steps.push(
    {
      id: "step-food",
      label: "Comparing restaurants, cafes & grocery walkability",
      detail: "Scanning culinary density, everyday dining spots, and supermarket walkability",
      status: "idle",
      queryCount: 4,
    },
    {
      id: "step-hotels",
      label: "Searching first-week temporary hotels",
      detail: `Querying SerpApi Google Hotels for short-term stays near ${office}`,
      status: "idle",
      queryCount: 1,
    },
    {
      id: "step-reviews",
      label: "Analyzing local community reviews & sentiment",
      detail: "Extracting recurring themes: traffic bottlenecks, water availability, quietness, and safety",
      status: "idle",
      queryCount: 4,
    },
    {
      id: "step-shortlist",
      label: "Building your personalized shortlist & trade-off matrix",
      detail: "Applying weighted multi-factor scoring model and synthesizing recommendation rationales",
      status: "idle",
      queryCount: 0,
    }
  );

  return {
    planId,
    userConstraints: constraints,
    candidateLocalities: [],
    steps,
  };
}
