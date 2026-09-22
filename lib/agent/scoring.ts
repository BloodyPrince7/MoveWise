import { NeighborhoodData, NeighborhoodScore, ScoreFactorBreakdown, UserConstraints } from "@/types/relocation";

export interface ScoringWeights {
  budget: number;
  commute: number;
  gym: number;
  food: number;
  groceries: number;
  transit: number;
  custom?: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  budget: 0.30,
  commute: 0.25,
  gym: 0.15,
  food: 0.10,
  groceries: 0.10,
  transit: 0.10,
};

export function calculateNeighborhoodScore(
  data: NeighborhoodData,
  constraints: UserConstraints,
  customWeights?: Partial<ScoringWeights>
): NeighborhoodScore {
  const baseWeights = { ...DEFAULT_SCORING_WEIGHTS, ...customWeights };

  // Handle Gym weight if not required
  if (!constraints.gymRequired) {
    baseWeights.gym = 0;
  }

  // Handle Dynamic Custom Requirements (e.g. "school nearby 1km", "hospital within 2km")
  const customReqs = constraints.customRequirements || [];
  const customFactors: Record<string, ScoreFactorBreakdown> = {};
  let totalCustomWeightedValue = 0;
  let customWeightPerReq = 0;

  if (customReqs.length > 0) {
    // Dedicate e.g. 15% to 20% of total score to custom requirements
    const totalCustomWeight = Math.min(0.25, customReqs.length * 0.12);
    customWeightPerReq = Number((totalCustomWeight / customReqs.length).toFixed(2));

    // Rebalance standard weights proportionally
    const scaleFactor = 1 - totalCustomWeight;
    baseWeights.budget = Number((baseWeights.budget * scaleFactor).toFixed(2));
    baseWeights.commute = Number((baseWeights.commute * scaleFactor).toFixed(2));
    baseWeights.gym = Number((baseWeights.gym * scaleFactor).toFixed(2));
    baseWeights.food = Number((baseWeights.food * scaleFactor).toFixed(2));
    baseWeights.groceries = Number((baseWeights.groceries * scaleFactor).toFixed(2));
    baseWeights.transit = Number((baseWeights.transit * scaleFactor).toFixed(2));
  }

  const whyMatched: string[] = [];
  const tradeOffs: string[] = [];

  // 1. Budget Evaluation
  const rentRange = constraints.accommodationType === "2BHK" ? data.estimatedRent.bhk2 : data.estimatedRent.bhk1;
  let budgetScore = 60;
  let budgetSummary = "";

  if (rentRange.min === 0 && rentRange.max === 0) {
    budgetScore = 50;
    budgetSummary = "Not enough data to evaluate.";
    tradeOffs.push("Rental listing data is sparse; field verification recommended.");
  } else if (rentRange.max <= constraints.budgetMonthlyInr) {
    budgetScore = 95;
    budgetSummary = `Comfortably within budget (₹${(rentRange.min / 1000).toFixed(0)}k–₹${(rentRange.max / 1000).toFixed(0)}k vs ₹${(constraints.budgetMonthlyInr / 1000).toFixed(0)}k target).`;
    whyMatched.push(`Rent fits comfortably within your ₹${(constraints.budgetMonthlyInr / 1000).toFixed(0)}k budget`);
  } else if (rentRange.min <= constraints.budgetMonthlyInr) {
    budgetScore = 80;
    budgetSummary = `Starting rents fit budget, though furnished/premium units reach ₹${(rentRange.max / 1000).toFixed(0)}k.`;
    whyMatched.push(`Entry-level ${constraints.accommodationType} rents meet your ₹${(constraints.budgetMonthlyInr / 1000).toFixed(0)}k budget`);
    tradeOffs.push(`High-end furnished options may push past your budget (up to ₹${(rentRange.max / 1000).toFixed(0)}k)`);
  } else {
    const overage = rentRange.min - constraints.budgetMonthlyInr;
    budgetScore = Math.max(20, Math.round(70 - (overage / 5000) * 20));
    budgetSummary = `Exceeds current budget by approximately ₹${(overage / 1000).toFixed(1)}k.`;
    tradeOffs.push(`Average rent is ₹${(overage / 1000).toFixed(0)}k higher than your target ₹${(constraints.budgetMonthlyInr / 1000).toFixed(0)}k`);
  }

  // 2. Commute Evaluation
  let commuteScore = 70;
  let commuteSummary = "";
  const targetCommute = constraints.maxCommuteMin || 30;

  if (data.commute.peakMinutes <= targetCommute) {
    commuteScore = 96;
    commuteSummary = `Fast commute (~${data.commute.estimatedMinutes}–${data.commute.peakMinutes} min) meets your <${targetCommute} min target.`;
    whyMatched.push(`Commute is within your target (~${data.commute.estimatedMinutes}–${data.commute.peakMinutes} mins)`);
  } else if (data.commute.estimatedMinutes <= targetCommute) {
    commuteScore = 82;
    commuteSummary = `Normal commute (~${data.commute.estimatedMinutes} min) fits, but peak traffic may reach ${data.commute.peakMinutes} min.`;
    whyMatched.push(`Off-peak commute (~${data.commute.estimatedMinutes} min) is within target`);
    tradeOffs.push(`Peak-hour traffic can increase commute up to ~${data.commute.peakMinutes} mins`);
  } else {
    const diff = data.commute.estimatedMinutes - targetCommute;
    commuteScore = Math.max(30, 75 - diff * 4);
    commuteSummary = `Commute (${data.commute.estimatedMinutes}–${data.commute.peakMinutes} min) exceeds your ${targetCommute} min goal.`;
    tradeOffs.push(`Travel time exceeds your ${targetCommute} min preference`);
  }

  // 3. Gym Proximity Evaluation
  let gymScore = 80;
  let gymSummary = "";
  if (!constraints.gymRequired) {
    gymScore = 100;
    gymSummary = "Not prioritized by user.";
  } else {
    const targetDist = constraints.maxGymDistKm || 2;
    const nearest = data.gyms.nearestDistanceKm;

    if (nearest <= 0.8) {
      gymScore = 98;
      gymSummary = `Walking distance (${nearest} km) to top-rated gym.`;
      whyMatched.push(`Gym within walking distance (${nearest} km)`);
    } else if (nearest <= targetDist) {
      gymScore = 88;
      gymSummary = `Within your ${targetDist} km radius (${nearest} km to closest gym).`;
      whyMatched.push(`Gym requirement satisfied (${nearest} km away)`);
    } else {
      gymScore = 45;
      gymSummary = `Nearest gym is ${nearest} km, exceeding ${targetDist} km limit.`;
      tradeOffs.push(`Nearest gym is ${nearest} km away, beyond your ${targetDist} km preference`);
    }
  }

  // 4. Food / Dining Scene Evaluation
  let foodScore = 75;
  let foodSummary = "";
  if (data.restaurants.countFound >= 25) {
    foodScore = 95;
    foodSummary = `Vibrant food scene with ${data.restaurants.countFound}+ dining options.`;
    whyMatched.push("Abundant dining options and cafes nearby");
  } else {
    foodScore = 80;
    foodSummary = "Good everyday food availability.";
    whyMatched.push("Everyday restaurants available");
  }

  // 5. Grocery & Daily Needs Evaluation
  let groceryScore = 75;
  let grocerySummary = "";
  if (data.groceries.quickCommerceAvailable && data.groceries.countFound >= 8) {
    groceryScore = 95;
    grocerySummary = "Supermarkets plus 10-minute quick-commerce delivery active.";
    whyMatched.push("Supermarkets and instant grocery delivery accessible");
  } else {
    groceryScore = 80;
    grocerySummary = "Daily grocery stores nearby.";
  }

  // 6. Public Transit / Metro Connectivity
  let transitScore = 70;
  let transitSummary = "";
  if (data.transit.metroDistanceKm && data.transit.metroDistanceKm <= 1.0) {
    transitScore = 96;
    transitSummary = `Only ${data.transit.metroDistanceKm} km to ${data.transit.nearestMetroStation || "Metro station"}.`;
    whyMatched.push(`Near ${data.transit.nearestMetroStation} (${data.transit.metroDistanceKm} km)`);
  } else if (data.transit.metroDistanceKm && data.transit.metroDistanceKm <= 2.0) {
    transitScore = 85;
    transitSummary = `Feeder distance (${data.transit.metroDistanceKm} km) to Metro.`;
  } else {
    transitScore = 75;
    transitSummary = "Direct bus connectivity active.";
  }

  // 7. Dynamic Custom Factors Evaluation (Schools, Hospitals, Daycares, etc.)
  customReqs.forEach((cr) => {
    const amenity = data.customAmenities?.find((a) => a.category.toLowerCase() === cr.category.toLowerCase());
    const nearestDist = amenity?.nearestDistanceKm !== undefined ? amenity.nearestDistanceKm : 0.8;
    const targetDist = cr.targetDistanceKm || 1.5;

    let cScore = 75;
    let cSummary = "";

    if (nearestDist <= targetDist) {
      cScore = 96;
      cSummary = `Nearest ${cr.label.toLowerCase()} is only ${nearestDist} km away, comfortably within your ${targetDist} km target.`;
      whyMatched.push(`Top-rated ${cr.label.toLowerCase()} within target (${nearestDist} km away)`);
    } else if (nearestDist <= targetDist * 1.4) {
      cScore = 76;
      cSummary = `Nearest ${cr.label.toLowerCase()} is ${nearestDist} km away, slightly beyond your ${targetDist} km preference.`;
      tradeOffs.push(`${cr.label} is ${nearestDist} km away (target was ${targetDist} km)`);
    } else {
      cScore = 40;
      cSummary = `Nearest ${cr.label.toLowerCase()} is ${nearestDist} km away, exceeding your ${targetDist} km target.`;
      tradeOffs.push(`Nearest ${cr.label.toLowerCase()} is ${nearestDist} km away, exceeding ${targetDist} km preference`);
    }

    const cWeighted = Math.round(cScore * customWeightPerReq);
    totalCustomWeightedValue += cWeighted;

    customFactors[cr.category] = {
      score: cScore,
      weight: customWeightPerReq,
      weightedValue: cWeighted,
      summary: cSummary,
    };
  });

  const fBudget: ScoreFactorBreakdown = {
    score: budgetScore,
    weight: baseWeights.budget,
    weightedValue: Math.round(budgetScore * baseWeights.budget),
    summary: budgetSummary,
  };
  const fCommute: ScoreFactorBreakdown = {
    score: commuteScore,
    weight: baseWeights.commute,
    weightedValue: Math.round(commuteScore * baseWeights.commute),
    summary: commuteSummary,
  };
  const fGym: ScoreFactorBreakdown = {
    score: gymScore,
    weight: baseWeights.gym,
    weightedValue: Math.round(gymScore * baseWeights.gym),
    summary: gymSummary,
  };
  const fFood: ScoreFactorBreakdown = {
    score: foodScore,
    weight: baseWeights.food,
    weightedValue: Math.round(foodScore * baseWeights.food),
    summary: foodSummary,
  };
  const fGroceries: ScoreFactorBreakdown = {
    score: groceryScore,
    weight: baseWeights.groceries,
    weightedValue: Math.round(groceryScore * baseWeights.groceries),
    summary: grocerySummary,
  };
  const fTransit: ScoreFactorBreakdown = {
    score: transitScore,
    weight: baseWeights.transit,
    weightedValue: Math.round(transitScore * baseWeights.transit),
    summary: transitSummary,
  };

  const overallScore = Math.min(
    99,
    fBudget.weightedValue +
      fCommute.weightedValue +
      fGym.weightedValue +
      fFood.weightedValue +
      fGroceries.weightedValue +
      fTransit.weightedValue +
      totalCustomWeightedValue
  );

  return {
    neighborhoodId: data.id,
    neighborhoodName: data.name,
    overallScore,
    factors: {
      budget: fBudget,
      commute: fCommute,
      gym: fGym,
      food: fFood,
      groceries: fGroceries,
      transit: fTransit,
      customFactors,
    },
    whyMatched,
    tradeOffs,
    recommendationSummary: `${data.name} earns a ${overallScore}/100 match with your preferences.`,
  };
}
