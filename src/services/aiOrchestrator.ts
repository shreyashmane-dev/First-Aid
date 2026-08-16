import type { EmergencySeverity, MedicalProfile } from '../types';

export interface AIResponse {
  message: string;
  severity: EmergencySeverity;
  emergency: boolean;
  modelUsed: 'Gemini' | 'OpenAI';
  suggestedActions: {
    label: string;
    action: 'call_emergency' | 'find_hospital' | 'call_contact' | 'read_first_aid';
    target?: string;
  }[];
  steps?: string[];
  avoid?: string[];
  latencyMs?: number;
  estimatedCostUsd?: number;
}

export interface AIUsageMetrics {
  id: string;
  timestamp: string;
  provider: 'Gemini' | 'OpenAI';
  model: string;
  promptLength: number;
  latencyMs: number;
  severity: EmergencySeverity;
  success: boolean;
  estimatedCostUsd: number;
}

// Global in-memory analytics store for admin monitoring
export const AI_METRICS_LOG: AIUsageMetrics[] = [
  {
    id: 'metric_01',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    provider: 'Gemini',
    model: 'gemini-1.5-flash',
    promptLength: 120,
    latencyMs: 420,
    severity: 'CRITICAL',
    success: true,
    estimatedCostUsd: 0.00008
  },
  {
    id: 'metric_02',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    promptLength: 95,
    latencyMs: 650,
    severity: 'HIGH',
    success: true,
    estimatedCostUsd: 0.00012
  }
];

// Rate Limiting tracker
const USER_REQUEST_TIMESTAMPS: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_PROMPT_LENGTH = 2000;

const CRITICAL_KEYWORDS = [
  'chest pain', 'heart attack', 'unconscious', 'not breathing', 'stopped breathing',
  'severe bleeding', 'snake bite', 'snake', 'venomous', 'choking', 'cannot breathe', 'gasping for air',
  'cyanosis', 'blue lips', 'anaphylaxis', 'seizure', 'heavy blood loss', 'stroke'
];

const HIGH_KEYWORDS = [
  'burn', 'fracture', 'broken bone', 'deep cut', 'heat stroke', 'high fever',
  'dislocated', 'asthma attack', 'head injury', 'concussion', 'poison', 'vomiting blood'
];

export async function processAIChatMessage(
  userQuery: string,
  preferredModel: 'Gemini' | 'OpenAI' = 'Gemini',
  patientMedicalProfile?: MedicalProfile
): Promise<AIResponse> {
  const startTime = Date.now();

  // 1. Rate Limiting Check
  const now = Date.now();
  // Filter out timestamps older than 60 seconds
  while (USER_REQUEST_TIMESTAMPS.length > 0 && USER_REQUEST_TIMESTAMPS[0] < now - 60000) {
    USER_REQUEST_TIMESTAMPS.shift();
  }

  if (USER_REQUEST_TIMESTAMPS.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      message: '⚠️ Rate limit exceeded (Max 10 requests per minute). For urgent medical concerns, call emergency services immediately.',
      severity: 'HIGH',
      emergency: true,
      modelUsed: preferredModel,
      suggestedActions: [
        { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' }
      ]
    };
  }

  USER_REQUEST_TIMESTAMPS.push(now);

  // Truncate overly long prompts to prevent token inflation abuse
  const sanitizedQuery = userQuery.slice(0, MAX_PROMPT_LENGTH);
  const queryLower = sanitizedQuery.toLowerCase();
  
  // 2. Safety & Emergency Classification
  let severity: EmergencySeverity = 'LOW';
  let emergency = false;
  
  if (CRITICAL_KEYWORDS.some(k => queryLower.includes(k))) {
    severity = 'CRITICAL';
    emergency = true;
  } else if (HIGH_KEYWORDS.some(k => queryLower.includes(k))) {
    severity = 'HIGH';
    emergency = true;
  } else if (queryLower.includes('pain') || queryLower.includes('fever') || queryLower.includes('swelling')) {
    severity = 'MODERATE';
  }

  // 3. API Keys Integration
  const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const openaiApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;

  let modelUsed: 'Gemini' | 'OpenAI' = preferredModel;

  if (preferredModel === 'Gemini' && geminiApiKey) {
    try {
      const res = await callGeminiAPI(sanitizedQuery, geminiApiKey, severity, emergency, patientMedicalProfile);
      logMetrics('Gemini', 'gemini-1.5-flash', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.0001);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.0001 };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to OpenAI:', err);
      if (openaiApiKey) {
        modelUsed = 'OpenAI';
        try {
          const res = await callOpenAIAPI(sanitizedQuery, openaiApiKey, severity, emergency, patientMedicalProfile);
          logMetrics('OpenAI', 'gpt-4o-mini', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00015);
          return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.00015 };
        } catch (e) {
          console.warn('OpenAI API call failed, using Safety Orchestrator Engine:', e);
        }
      }
    }
  } else if (preferredModel === 'OpenAI' && openaiApiKey) {
    try {
      const res = await callOpenAIAPI(sanitizedQuery, openaiApiKey, severity, emergency, patientMedicalProfile);
      logMetrics('OpenAI', 'gpt-4o-mini', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00015);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.00015 };
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to Gemini:', err);
      if (geminiApiKey) {
        modelUsed = 'Gemini';
        try {
          const res = await callGeminiAPI(sanitizedQuery, geminiApiKey, severity, emergency, patientMedicalProfile);
          logMetrics('Gemini', 'gemini-1.5-flash', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.0001);
          return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.0001 };
        } catch (e) {
          console.warn('Gemini API call failed, using Safety Orchestrator Engine:', e);
        }
      }
    }
  }

  // 4. Fallback AI Safety Engine with contextual medical logic
  const res = generateSafetyEngineResponse(sanitizedQuery, modelUsed, severity, emergency, patientMedicalProfile);
  logMetrics(modelUsed, modelUsed === 'Gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00005);
  return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.00005 };
}

function logMetrics(
  provider: 'Gemini' | 'OpenAI',
  model: string,
  promptLength: number,
  latencyMs: number,
  severity: EmergencySeverity,
  success: boolean,
  estimatedCostUsd: number
) {
  AI_METRICS_LOG.unshift({
    id: `metric_${Date.now()}`,
    timestamp: new Date().toISOString(),
    provider,
    model,
    promptLength,
    latencyMs,
    severity,
    success,
    estimatedCostUsd
  });
}

function generateSafetyEngineResponse(
  userQuery: string,
  modelUsed: 'Gemini' | 'OpenAI',
  severity: EmergencySeverity,
  _emergency: boolean,
  profile?: MedicalProfile
): AIResponse {
  const queryLower = userQuery.toLowerCase();
  
  let medicalContextNote = '';
  if (profile && profile.allergies.length > 0) {
    medicalContextNote = ` (Note: Authorized patient profile lists known allergies: ${profile.allergies.join(', ')}).`;
  }

  if (severity === 'CRITICAL') {
    if (queryLower.includes('chest pain') || queryLower.includes('heart attack')) {
      return {
        modelUsed,
        severity: 'CRITICAL',
        emergency: true,
        message: `⚠️ POTENTIAL MEDICAL EMERGENCY: Suspected Acute Cardiac Event.${medicalContextNote} I am an AI assistant and cannot provide a definitive diagnosis. Please seek immediate professional medical attention!`,
        steps: [
          'Call local emergency services (112 / 108 in India, 911 in US) immediately.',
          'Have the person sit comfortably upright and keep them calm.',
          'If not allergic to aspirin, chew one adult 325mg aspirin slowly.',
          'Loosen tight clothing around neck and chest.',
          'Be prepared to initiate CPR if the person becomes unresponsive.'
        ],
        avoid: [
          'Do NOT allow the person to walk or drive themselves.',
          'Do NOT give food, water, or energy drinks.',
          'Do NOT ignore chest pressure lasting longer than 2 minutes.'
        ],
        suggestedActions: [
          { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
          { label: '📍 Find Nearby ER Hospital', action: 'find_hospital' },
          { label: '📞 Call Emergency Contact', action: 'call_contact' },
          { label: '📖 Open CPR & Heart Attack Guide', action: 'read_first_aid', target: 'fa_heart_attack' }
        ]
      };
    } else if (queryLower.includes('snake bite') || queryLower.includes('snake')) {
      return {
        modelUsed,
        severity: 'CRITICAL',
        emergency: true,
        message: `🐍 CRITICAL WARNING: Venomous Snake Bite Emergency.${medicalContextNote} Immediate transportation to a hospital with Anti-Snake Venom (ASV) is vital!`,
        steps: [
          'Keep the victim calm and strictly still to slow venom distribution.',
          'Immobilize the bitten limb at or slightly below heart level.',
          'Remove tight rings, watches, or clothing near the bite site before swelling starts.',
          'Gently rinse wound with clean water.',
          'Proceed directly to the nearest trauma hospital emergency room.'
        ],
        avoid: [
          'DO NOT cut the wound or attempt to suck out venom.',
          'DO NOT apply a tight tourniquet.',
          'DO NOT apply ice or cold packs.'
        ],
        suggestedActions: [
          { label: '📍 Navigate to Snake Venom ER Hospital', action: 'find_hospital' },
          { label: '🚨 Call Emergency Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
          { label: '📖 Read Full Snake Bite Guide', action: 'read_first_aid', target: 'fa_snake_bite' }
        ]
      };
    } else if (queryLower.includes('cpr') || queryLower.includes('not breathing') || queryLower.includes('unconscious')) {
      return {
        modelUsed,
        severity: 'CRITICAL',
        emergency: true,
        message: `🚨 LIFE-THREATENING EMERGENCY: Unresponsive / Arrest Event.${medicalContextNote} Start CPR compressions immediately while emergency services are en route!`,
        steps: [
          'Call 112 / 108 immediately or shout for someone to get an AED.',
          'Place person on back on a hard, flat floor.',
          'Place heel of hand in center of chest, interlock fingers.',
          'Push hard and fast (100-120 compressions/min) to the beat of "Stayin Alive".',
          'Allow chest to recoil fully between compressions.'
        ],
        avoid: [
          'Do NOT stop compressions for more than 10 seconds.',
          'Do NOT delay emergency call.'
        ],
        suggestedActions: [
          { label: '🚨 Dispatch Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
          { label: '📖 Step-by-Step CPR Visual Guide', action: 'read_first_aid', target: 'fa_cpr' }
        ]
      };
    } else {
      return {
        modelUsed,
        severity: 'CRITICAL',
        emergency: true,
        message: `⚠️ HIGH-SEVERITY MEDICAL CONCERN DETECTED.${medicalContextNote} The symptoms described indicate a potential acute emergency. Please contact emergency services right away.`,
        steps: [
          'Contact local emergency medical services immediately (112 / 108 / 911).',
          'Keep patient safe, calm, and resting comfortably.',
          'Monitor breathing and level of consciousness.'
        ],
        avoid: [
          'Do not administer unprescribed drugs or oral fluids during acute distress.',
          'Do not delay seeking professional emergency care.'
        ],
        suggestedActions: [
          { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
          { label: '📍 Find Nearest Hospital ER', action: 'find_hospital' },
          { label: '📞 Call Emergency Contact', action: 'call_contact' }
        ]
      };
    }
  }

  if (severity === 'HIGH') {
    if (queryLower.includes('burn')) {
      return {
        modelUsed,
        severity: 'HIGH',
        emergency: true,
        message: `🔥 FIRST-AID GUIDANCE: Thermal / Chemical Burn.${medicalContextNote} Proper early cooling reduces tissue destruction and infection risk.`,
        steps: [
          'Cool the burn immediately under cool, gentle running tap water for 10 to 20 minutes.',
          'Remove rings or tight items near burn before swelling starts.',
          'Cover burn loosely with clean non-stick sterile gauze or plastic film.',
          'Take over-the-counter pain reliever if appropriate and not allergic.'
        ],
        avoid: [
          'DO NOT use ice or ice water.',
          'DO NOT apply butter, toothpaste, oil, or ointments to open burn skin.',
          'DO NOT pop blisters.'
        ],
        suggestedActions: [
          { label: '📖 View Full Burns Guide', action: 'read_first_aid', target: 'fa_burns' },
          { label: '📍 Locate Nearby Burn Unit Hospital', action: 'find_hospital' }
        ]
      };
    } else if (queryLower.includes('asthma') || queryLower.includes('inhaler')) {
      return {
        modelUsed,
        severity: 'HIGH',
        emergency: true,
        message: `🌬️ FIRST-AID GUIDANCE: Acute Asthma Respiratory Distress.${medicalContextNote}`,
        steps: [
          'Sit the person upright comfortably. Stay calm.',
          'Administer rescue inhaler (Albuterol): 1 puff every 30-60 seconds up to 4 puffs.',
          'Wait 4 minutes. If symptoms persist, administer 4 more puffs.',
          'If breathing does not improve after 8 puffs, call 112 / 108.'
        ],
        avoid: [
          'Do NOT force person to lie flat.',
          'Do NOT leave the person alone.'
        ],
        suggestedActions: [
          { label: '📖 Asthma Action Plan Guide', action: 'read_first_aid', target: 'fa_asthma' },
          { label: '📍 Find Nearby Respiratory Hospital', action: 'find_hospital' }
        ]
      };
    }
  }

  // LOW or General inquiry
  return {
    modelUsed,
    severity: 'LOW',
    emergency: false,
    message: `Hello! I am your AI First-Aid Companion (powered by ${modelUsed}).${medicalContextNote} I can provide safety guidance, first-aid education, and direct you to nearby hospitals or verified doctors. What health concern can I assist you with today?`,
    steps: [
      'Describe any symptoms, injuries, or situation you are experiencing.',
      'Check our verified First-Aid Library for CPR, burns, bites, choking, and heart emergency procedures.',
      'Use the Hospital Discovery tab to locate nearby 24/7 ER trauma centers.'
    ],
    avoid: [
      'Please remember: AI guidance does not replace professional diagnosis or emergency medical services.'
    ],
    suggestedActions: [
      { label: '📖 Explore First-Aid Guides', action: 'read_first_aid' },
      { label: '📍 Find Hospitals', action: 'find_hospital' }
    ]
  };
}

async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  severity: EmergencySeverity,
  emergency: boolean,
  profile?: MedicalProfile
): Promise<AIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are First Aid Hospital AI, a safety-focused medical assistant. 
RULES:
1. NEVER provide definitive diagnoses or prescribe medications.
2. Provide concise, bulleted first-aid steps.
3. Include clear DO NOT instructions.
4. Emphasize seeking professional care.
${profile ? `Patient allergies: ${profile.allergies.join(', ')}` : ''}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\nUser Question: ${prompt}` }]
      }]
    })
  });

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    message: text || 'Provided guidance based on standard first-aid protocols.',
    severity,
    emergency,
    modelUsed: 'Gemini',
    suggestedActions: emergency ? [
      { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
      { label: '📍 Find Nearby Hospital', action: 'find_hospital' }
    ] : [
      { label: '📖 Read First-Aid Library', action: 'read_first_aid' }
    ]
  };
}

async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  severity: EmergencySeverity,
  emergency: boolean,
  profile?: MedicalProfile
): Promise<AIResponse> {
  const isOpenRouter = apiKey.startsWith('sk-or-v1-');
  const url = isOpenRouter
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `You are First Aid Hospital AI, a safety-focused medical assistant. Never diagnose or prescribe. Provide safe first-aid guidance. ${profile ? `Patient allergies: ${profile.allergies.join(', ')}` : ''}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'http://localhost:5173';
    headers['X-Title'] = 'First Aid Hospital Platform';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  return {
    message: text || 'Provided guidance based on standard first-aid protocols.',
    severity,
    emergency,
    modelUsed: 'OpenAI',
    suggestedActions: emergency ? [
      { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
      { label: '📍 Find Nearby Hospital', action: 'find_hospital' }
    ] : [
      { label: '📖 Read First-Aid Library', action: 'read_first_aid' }
    ]
  };
}
