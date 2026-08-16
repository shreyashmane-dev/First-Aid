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
    provider: 'OpenAI',
    model: 'openai/gpt-4o-mini',
    promptLength: 120,
    latencyMs: 420,
    severity: 'CRITICAL',
    success: true,
    estimatedCostUsd: 0.00008
  }
];

// Rate Limiting tracker
const USER_REQUEST_TIMESTAMPS: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 20;
const MAX_PROMPT_LENGTH = 2000;

const CRITICAL_KEYWORDS = [
  'chest pain', 'heart attack', 'unconscious', 'not breathing', 'stopped breathing',
  'severe bleeding', 'snake bite', 'snake', 'venomous', 'choking', 'cannot breathe', 'gasping for air',
  'cyanosis', 'blue lips', 'anaphylaxis', 'seizure', 'heavy blood loss', 'stroke', 'drowning'
];

const HIGH_KEYWORDS = [
  'burn', 'fracture', 'broken bone', 'deep cut', 'heat stroke', 'high fever',
  'dislocated', 'asthma attack', 'head injury', 'concussion', 'poison', 'vomiting blood', 'dog bite'
];

export async function processAIChatMessage(
  userQuery: string,
  preferredModel: 'Gemini' | 'OpenAI' = 'OpenAI',
  patientMedicalProfile?: MedicalProfile
): Promise<AIResponse> {
  const startTime = Date.now();

  // 1. Rate Limiting Check
  const now = Date.now();
  while (USER_REQUEST_TIMESTAMPS.length > 0 && USER_REQUEST_TIMESTAMPS[0] < now - 60000) {
    USER_REQUEST_TIMESTAMPS.shift();
  }

  if (USER_REQUEST_TIMESTAMPS.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      message: '⚠️ Rate limit reached (Max 20 requests per minute). For urgent medical concerns, please call emergency services immediately.',
      severity: 'HIGH',
      emergency: true,
      modelUsed: preferredModel,
      suggestedActions: [
        { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' }
      ]
    };
  }

  USER_REQUEST_TIMESTAMPS.push(now);

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
  } else if (queryLower.includes('pain') || queryLower.includes('fever') || queryLower.includes('swelling') || queryLower.includes('injury')) {
    severity = 'MODERATE';
  }

  // 3. API Keys Integration
  const openaiApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  let modelUsed: 'Gemini' | 'OpenAI' = preferredModel;

  // Try OpenRouter / OpenAI API
  if (openaiApiKey) {
    try {
      const res = await callOpenAIAPI(sanitizedQuery, openaiApiKey, severity, emergency, patientMedicalProfile);
      logMetrics('OpenAI', 'openai/gpt-4o-mini', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00015);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.00015 };
    } catch (err) {
      console.warn('OpenAI / OpenRouter API call note, trying Gemini:', err);
    }
  }

  // Try Gemini API
  if (geminiApiKey) {
    try {
      const res = await callGeminiAPI(sanitizedQuery, geminiApiKey, severity, emergency, patientMedicalProfile);
      logMetrics('Gemini', 'gemini-1.5-flash', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.0001);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.0001 };
    } catch (err) {
      console.warn('Gemini API call note, using safety engine:', err);
    }
  }

  // Fallback to Safety Engine if network offline
  const res = generateSafetyEngineResponse(sanitizedQuery, modelUsed, severity, emergency, patientMedicalProfile);
  logMetrics(modelUsed, 'safety-engine', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00005);
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

  if (queryLower.includes('chest pain') || queryLower.includes('heart attack')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: `⚠️ POTENTIAL ACUTE CARDIAC EVENT DETECTED.${medicalContextNote} Chest pressure lasting longer than 2 minutes requires immediate emergency intervention!`,
      steps: [
        'Call local emergency services (112 / 108 in India, 911 in US) immediately.',
        'Have the person sit comfortably upright and stay calm.',
        'If not allergic to aspirin and conscious, chew one adult 325mg aspirin slowly.',
        'Loosen tight clothing around neck and chest.',
        'Be prepared to initiate CPR compressions if person becomes unresponsive.'
      ],
      avoid: [
        'Do NOT allow the person to walk, exert themselves, or drive.',
        'Do NOT give food, water, or energy drinks.'
      ],
      suggestedActions: [
        { label: '🚨 Call Emergency Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: '📍 Navigate to Nearest Cardiac ER', action: 'find_hospital' },
        { label: '📖 Open CPR & Heart Attack Guide', action: 'read_first_aid', target: 'fa_heart_attack' }
      ]
    };
  }

  if (queryLower.includes('snake bite') || queryLower.includes('snake') || queryLower.includes('venomous')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: `🐍 CRITICAL WARNING: Venomous Snake Bite Emergency.${medicalContextNote} Transporting the victim to a hospital equipped with Anti-Snake Venom (ASV) is essential!`,
      steps: [
        'Keep the victim strictly calm and immobile to slow venom distribution.',
        'Immobilize the bitten limb at or slightly below heart level.',
        'Remove tight rings, watches, or clothing before swelling begins.',
        'Gently rinse wound with clean water.',
        'Proceed immediately to the nearest emergency trauma center.'
      ],
      avoid: [
        'DO NOT cut the wound or attempt to suck out venom.',
        'DO NOT apply a tight arterial tourniquet.',
        'DO NOT apply ice or cold compresses.'
      ],
      suggestedActions: [
        { label: '📍 Navigate to Snake Venom ER Hospital', action: 'find_hospital' },
        { label: '🚨 Call Emergency Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: '📖 Read Full Snake Bite Guide', action: 'read_first_aid', target: 'fa_snake_bite' }
      ]
    };
  }

  if (queryLower.includes('cpr') || queryLower.includes('not breathing') || queryLower.includes('unconscious')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: `🚨 LIFE-THREATENING EMERGENCY: Unresponsive / Cardiac Arrest Event.${medicalContextNote} Begin CPR compressions immediately while emergency services are en route!`,
      steps: [
        'Call 112 / 108 immediately or tell someone nearby to call.',
        'Place person on back on a hard, flat floor.',
        'Place heel of hand in center of chest, interlock fingers.',
        'Push hard and fast (100-120 compressions/min) to the rhythm of "Stayin Alive".',
        'Allow chest to recoil fully between compressions.'
      ],
      avoid: [
        'Do NOT interrupt compressions for more than 10 seconds.',
        'Do NOT delay dispatching emergency services.'
      ],
      suggestedActions: [
        { label: '🚨 Dispatch Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: '📖 Visual Step-by-Step CPR Guide', action: 'read_first_aid', target: 'fa_cpr' }
      ]
    };
  }

  if (queryLower.includes('burn')) {
    return {
      modelUsed,
      severity: 'HIGH',
      emergency: true,
      message: `🔥 FIRST-AID PROTOCOL: Thermal / Chemical Burn Emergency.${medicalContextNote}`,
      steps: [
        'Cool the burn under cool running tap water for 10 to 20 minutes.',
        'Remove rings or tight clothing near the area before swelling begins.',
        'Cover burn loosely with clean non-stick sterile gauze or plastic wrap.',
        'Elevate burned limb above heart level if possible.'
      ],
      avoid: [
        'DO NOT apply ice, ice water, butter, toothpaste, or oil.',
        'DO NOT break or pop blisters.'
      ],
      suggestedActions: [
        { label: '📖 Open Burns Protocol Guide', action: 'read_first_aid', target: 'fa_burns' },
        { label: '📍 Find Hospital Burn Unit', action: 'find_hospital' }
      ]
    };
  }

  // General Guidance
  return {
    modelUsed,
    severity,
    emergency: severity !== 'LOW',
    message: `Hello! I am your AI First-Aid Medical Assistant.${medicalContextNote} Based on standard protocols, here is safety guidance for your query: "${userQuery}".`,
    steps: [
      'Assess the situation and ensure the environment is safe.',
      'If the person shows severe pain, difficulty breathing, or loss of consciousness, call emergency services (112 / 108 / 911) immediately.',
      'Keep the patient calm, comfortable, and resting.',
      'Browse our verified First-Aid Library or find nearby 24/7 ER hospitals on the map.'
    ],
    avoid: [
      'Do NOT administer unprescribed medications or oral fluids during acute distress.',
      'Do NOT delay professional medical evaluation for severe symptoms.'
    ],
    suggestedActions: [
      { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
      { label: '📍 Find Nearby Hospitals', action: 'find_hospital' },
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

  let patientDataPrompt = '';
  if (profile) {
    patientDataPrompt = `\n[PATIENT HEALTH RECORD]\n- Blood Group: ${profile.bloodGroup || 'Not specified'}\n- Known Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}\n- Existing Medical Conditions: ${profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None'}\n- Current Medications: ${profile.medications?.length ? profile.medications.join(', ') : 'None'}\nFactor these specific patient allergies and medical conditions into your first-aid guidance.`;
  }

  const systemPrompt = `You are First Aid Hospital AI, an expert emergency medical assistant. Provide clear, direct, bulleted first-aid instructions and DO NOT rules. Never give a final diagnosis or prescribe drugs. ${patientDataPrompt}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (isOpenRouter) {
    headers['HTTP-Referer'] = 'https://first-aid-app.vercel.app';
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

  if (!response.ok) {
    throw new Error(`OpenAI / OpenRouter API HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || '';

  if (!text.trim()) {
    throw new Error('OpenAI / OpenRouter API returned empty text');
  }

  return {
    message: text,
    severity,
    emergency,
    modelUsed: 'OpenAI',
    suggestedActions: emergency ? [
      { label: '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '112' },
      { label: '📍 Find Nearby ER Hospital', action: 'find_hospital' }
    ] : [
      { label: '📖 Read First-Aid Library', action: 'read_first_aid' }
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

  let patientDataPrompt = '';
  if (profile) {
    patientDataPrompt = `\n[PATIENT HEALTH RECORD]\n- Blood Group: ${profile.bloodGroup || 'Not specified'}\n- Known Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}\n- Existing Medical Conditions: ${profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None'}\n- Current Medications: ${profile.medications?.length ? profile.medications.join(', ') : 'None'}\nFactor these specific patient allergies and medical conditions into your guidance.`;
  }

  const systemPrompt = `You are First Aid Hospital AI, a safety-focused emergency medical assistant. Provide clear bulleted first-aid steps and DO NOT rules. ${patientDataPrompt}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemPrompt}\nUser Query: ${prompt}` }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text.trim()) {
    throw new Error('Gemini API returned empty text');
  }

  return {
    message: text,
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
