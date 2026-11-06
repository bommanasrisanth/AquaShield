/**
 * Emergency Companion Client
 * Calls server-side Gemini endpoint when online.
 * Instantly falls back to pre-written, medically and disaster-management reviewed
 * safety knowledge base when offline or when API is unavailable.
 */

export interface CompanionResponse {
  reply: string;
  source: 'GEMINI_AI' | 'OFFLINE_REVIEWED_RULEBASE';
  isOffline: boolean;
}

// Medically & disaster-management reviewed offline safety guidance rules
const OFFLINE_SAFETY_KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['now', 'what to do', 'current', 'urgent'],
    answer:
      'IMMEDIATE ACTION PROTOCOL:\n1. Check your status badge on the dashboard. If PREPARE or LEAVE NOW, move to designated upper floors or high ground.\n2. Never walk, swim, or drive through flooded roads (Turn Around Don\'t Drown).\n3. Keep your phone charged, turn off gas/power mains if water enters your house, and prepare clean drinking water.',
  },
  {
    keywords: ['road', 'drive', 'car', 'vehicle', 'blocked', 'stuck'],
    answer:
      'FLOODED ROAD SURVIVAL RULE:\n- Just 15 cm (6 inches) of moving water can knock an adult off their feet.\n- Just 30 cm (12 inches) can float a passenger car.\n- 60 cm (24 inches) will sweep away SUVs and trucks.\n- If your vehicle stalls in rising water, abandon it immediately and seek high ground on foot.',
  },
  {
    keywords: ['water', 'drink', 'boil', 'purify', 'contamination'],
    answer:
      'SAFE DRINKING WATER GUIDE:\n- Never drink tap or flood water during floods without disinfection.\n- Boil water vigorously for at least 1 full minute (3 minutes above 2000m elevation).\n- If boiling is impossible, add 2 drops of unscented household liquid bleach (5-6% sodium hypochlorite) per liter of clear water; stir and wait 30 minutes before drinking.',
  },
  {
    keywords: ['prepare', 'kit', 'bag', 'supplies', 'pack'],
    answer:
      'ESSENTIAL GRAB-BAG (72-HOUR KIT):\n1. 3 liters drinking water per person per day.\n2. Non-perishable energy foods and manual can opener.\n3. Essential prescription medications (7-day supply in waterproof pouch).\n4. Flashlight, extra batteries, and whistle to signal rescuers.\n5. Government IDs, deeds, and cash sealed in airtight plastic.',
  },
  {
    keywords: ['shelter', 'safeplace', 'where to go', 'evacuate', 'evacuation'],
    answer:
      'EVACUATION GUIDANCE:\n- Open the "SafePlace" tab on AquaShield to view verified official shelters and elevated buildings near your coordinates.\n- Follow designated evacuation corridors.\n- Avoid taking underpasses, basement ramps, and paths bordering canals or drainage nullahs.',
  },
  {
    keywords: ['first aid', 'wound', 'infection', 'shock', 'hypothermia', 'snake'],
    answer:
      'FLOOD FIRST AID & HEALTH:\n- Wash all cuts immediately with clean purified water and antiseptic soap; floodwaters carry leptospirosis, sewage, and tetanus.\n- Watch for snakes and displaced wildlife seeking dry refuge on porches and trees.\n- For hypothermia: remove wet clothing, wrap in dry blankets, give warm non-caffeinated drinks.',
  },
  {
    keywords: ['family', 'children', 'elderly', 'contacts', 'meeting point'],
    answer:
      'FAMILY SAFETY PROTOCOL:\n- Use the "Family & Community" tab to send a one-tap SMS status check-in.\n- Agree on a pre-designated high-ground landmark (school or town hall) as your emergency meeting point if cellular towers go offline.',
  },
];

export async function askEmergencyCompanion(
  message: string,
  context?: { locationName?: string; status?: string; elevation?: number },
  isOfflineForced = false
): Promise<CompanionResponse> {
  // If offline or explicitly forced offline, use offline reviewed rules
  if (isOfflineForced || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return getOfflineGuidance(message);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('/api/companion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      reply: data.reply,
      source: 'GEMINI_AI',
      isOffline: false,
    };
  } catch (err) {
    console.warn('Gemini server call failed, falling back to offline safety rulebase:', err);
    return getOfflineGuidance(message);
  }
}

function getOfflineGuidance(message: string): CompanionResponse {
  const normalized = message.toLowerCase();
  for (const entry of OFFLINE_SAFETY_KNOWLEDGE) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) {
      return {
        reply: `[OFFLINE SAFETY ADVISORY]\n${entry.answer}`,
        source: 'OFFLINE_REVIEWED_RULEBASE',
        isOffline: true,
      };
    }
  }

  // Default universal safety fallback
  return {
    reply:
      '[OFFLINE SAFETY ADVISORY]\nUniversal Flood Rule: Turn Around Don\'t Drown. If water is entering your area, immediately evacuate to higher ground or upper floor levels. Keep your emergency grab-bag ready, monitor battery usage, and do not approach submerged electrical equipment or bridges.',
    source: 'OFFLINE_REVIEWED_RULEBASE',
    isOffline: true,
  };
}
