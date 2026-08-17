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
  'cyanosis', 'blue lips', 'anaphylaxis', 'seizure', 'heavy blood loss', 'stroke', 'drowning',
  'छातीत दुखणे', 'हृदयविकार', 'बेशुद्ध', 'श्वास बंद', 'साप चावला', 'विषारी साप', 'रक्तस्त्राव'
];

const HIGH_KEYWORDS = [
  'burn', 'fracture', 'broken bone', 'deep cut', 'heat stroke', 'high fever',
  'dislocated', 'asthma attack', 'head injury', 'concussion', 'poison', 'vomiting blood', 'dog bite',
  'भाजणे', 'हाड मोडणे', 'जखम', 'उष्णतेचा त्रास', 'ताप', 'दमा', 'विषबाधा', 'कुत्रा चावणे'
];

export async function processAIChatMessage(
  userQuery: string,
  preferredModel: 'Gemini' | 'OpenAI' = 'OpenAI',
  patientMedicalProfile?: MedicalProfile,
  language: 'en' | 'mr' = 'en'
): Promise<AIResponse> {
  const startTime = Date.now();

  // 1. Rate Limiting Check
  const now = Date.now();
  while (USER_REQUEST_TIMESTAMPS.length > 0 && USER_REQUEST_TIMESTAMPS[0] < now - 60000) {
    USER_REQUEST_TIMESTAMPS.shift();
  }

  if (USER_REQUEST_TIMESTAMPS.length >= MAX_REQUESTS_PER_MINUTE) {
    return {
      message: language === 'mr'
        ? '⚠️ मर्यादा गाठली आहे (दर मिनिटाला कमाल २० विनंत्या). तात्काळ वैद्यकीय मदतीसाठी कृपया 108 किंवा 112 वर त्वरित कॉल करा.'
        : '⚠️ Rate limit reached (Max 20 requests per minute). For urgent medical concerns, please call emergency services immediately.',
      severity: 'HIGH',
      emergency: true,
      modelUsed: preferredModel,
      suggestedActions: [
        { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '108' }
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
  } else if (
    queryLower.includes('pain') || queryLower.includes('fever') || queryLower.includes('swelling') || queryLower.includes('injury') ||
    queryLower.includes('दुखणे') || queryLower.includes('ताप') || queryLower.includes('सूज') || queryLower.includes('इजा')
  ) {
    severity = 'MODERATE';
  }

  // 3. API Keys Integration
  const openaiApiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY || (import.meta as any).env?.VITE_OPENROUTER_API_KEY;
  const geminiApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const modelUsed: 'Gemini' | 'OpenAI' = preferredModel;

  // Try OpenRouter / OpenAI API
  if (openaiApiKey) {
    try {
      const res = await callOpenAIAPI(sanitizedQuery, openaiApiKey, severity, emergency, patientMedicalProfile, language);
      logMetrics('OpenAI', 'openai/gpt-4o-mini', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.00015);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.00015 };
    } catch (err) {
      console.warn('OpenAI / OpenRouter API call note, trying Gemini:', err);
    }
  }

  // Try Gemini API
  if (geminiApiKey) {
    try {
      const res = await callGeminiAPI(sanitizedQuery, geminiApiKey, severity, emergency, patientMedicalProfile, language);
      logMetrics('Gemini', 'gemini-1.5-flash', sanitizedQuery.length, Date.now() - startTime, severity, true, 0.0001);
      return { ...res, latencyMs: Date.now() - startTime, estimatedCostUsd: 0.0001 };
    } catch (err) {
      console.warn('Gemini API call note, using safety engine:', err);
    }
  }

  // Fallback to Safety Engine if network offline
  const res = generateSafetyEngineResponse(sanitizedQuery, modelUsed, severity, emergency, patientMedicalProfile, language);
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
  profile?: MedicalProfile,
  language: 'en' | 'mr' = 'en'
): AIResponse {
  const queryLower = userQuery.toLowerCase();
  
  let medicalContextNote = '';
  if (profile && profile.allergies.length > 0) {
    medicalContextNote = language === 'mr'
      ? ` (टीप: रुग्णाच्या प्रोफाईलमधील ॲलर्जी: ${profile.allergies.join(', ')}).`
      : ` (Note: Authorized patient profile lists known allergies: ${profile.allergies.join(', ')}).`;
  }

  if (queryLower.includes('chest pain') || queryLower.includes('heart attack') || queryLower.includes('छातीत दुखणे') || queryLower.includes('हृदयविकार')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: language === 'mr'
        ? `⚠️ अतिमहत्त्वाची आणीबाणी: हृदयविकाराची संभाव्य लक्षणे आढळली आहेत.${medicalContextNote} २ मिनिटांपेक्षा जास्त काळ छातीत दाब किंवा वेदना असल्यास तात्काळ आणीबाणी मदत आवश्यक आहे!`
        : `⚠️ POTENTIAL ACUTE CARDIAC EVENT DETECTED.${medicalContextNote} Chest pressure lasting longer than 2 minutes requires immediate emergency intervention!`,
      steps: language === 'mr' ? [
        'त्वरित १०८ किंवा ११२ वर आपत्कालीन रुग्णवाहिकेला कॉल करा.',
        'व्यक्तीला शांत बसवा आणि ताठ आरामदायी स्थितीत विश्रांती द्या.',
        'रुग्ण सावध असल्यास आणि ॲस्पिरिनची ॲलर्जी नसल्यास ३२५ मिलीग्राम ॲस्पिरिन चावून खाण्यास सांगा.',
        'गळ्याभोवतीचे आणि छातीचे कपडे सैल करा.',
        'व्यक्ती बेशुद्ध झाल्यास त्वरित सीपीआर (CPR) सुरू करण्याची तयारी ठेवा.'
      ] : [
        'Call local emergency services (112 / 108 in India, 911 in US) immediately.',
        'Have the person sit comfortably upright and stay calm.',
        'If not allergic to aspirin and conscious, chew one adult 325mg aspirin slowly.',
        'Loosen tight clothing around neck and chest.',
        'Be prepared to initiate CPR compressions if person becomes unresponsive.'
      ],
      avoid: language === 'mr' ? [
        'व्यक्तीला चालण्यास, जास्त हालचाल करण्यास किंवा गाडी चालवण्यास मनाई करा.',
        'अन्न, पाणी किंवा एनर्जी ड्रिंक देऊ नका.'
      ] : [
        'Do NOT allow the person to walk, exert themselves, or drive.',
        'Do NOT give food, water, or energy drinks.'
      ],
      suggestedActions: [
        { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Call Emergency Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: language === 'mr' ? '📍 जवळचे हृदयविकार रुग्णालय' : '📍 Navigate to Nearest Cardiac ER', action: 'find_hospital' },
        { label: language === 'mr' ? '📖 सीपीआर मार्गदर्शिका' : '📖 Open CPR & Heart Attack Guide', action: 'read_first_aid', target: 'fa_heart_attack' }
      ]
    };
  }

  if (queryLower.includes('snake bite') || queryLower.includes('snake') || queryLower.includes('venomous') || queryLower.includes('साप')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: language === 'mr'
        ? `🐍 अतिमहत्त्वाची आणीबाणी: विषारी साप चावल्याची शक्यता.${medicalContextNote} रुग्णाला अँटी-स्नेक व्हेनम (ASV) उपलब्ध असलेल्या जवळच्या रुग्णालयात पोहोचवणे अत्यंत गरजेचे आहे!`
        : `🐍 CRITICAL WARNING: Venomous Snake Bite Emergency.${medicalContextNote} Transporting the victim to a hospital equipped with Anti-Snake Venom (ASV) is essential!`,
      steps: language === 'mr' ? [
        'रुग्णाला पूर्णपणे शांत व स्थिर ठेवा जेणेकरून विषाचा प्रसार मंदावेल.',
        'चावलेला भाग हृदयाच्या पातळीखाली किंवा समांतर ठेवा.',
        'सूज येण्यापूर्वी घड्याळ, अंगठ्या आणि घट्ट कपडे काढून टाका.',
        'जखम स्वच्छ पाण्याने हळूच धुवून घ्या.',
        'तात्काळ जवळच्या आपत्कालीन रुग्णालयात घेऊन जा.'
      ] : [
        'Keep the victim strictly calm and immobile to slow venom distribution.',
        'Immobilize the bitten limb at or slightly below heart level.',
        'Remove tight rings, watches, or clothing before swelling begins.',
        'Gently rinse wound with clean water.',
        'Proceed immediately to the nearest emergency trauma center.'
      ],
      avoid: language === 'mr' ? [
        'जखमेवर चीरा मारू नका किंवा तोंड लावून विष शोषू नका.',
        'अतिघट्ट पट्टी (टॉर्निकेट) बांधू नका.',
        'बर्फ किंवा थंड पाणी लावू नका.'
      ] : [
        'DO NOT cut the wound or attempt to suck out venom.',
        'DO NOT apply a tight arterial tourniquet.',
        'DO NOT apply ice or cold compresses.'
      ],
      suggestedActions: [
        { label: language === 'mr' ? '📍 सर्पदंश उपचार रुग्णालय शोधा' : '📍 Navigate to Snake Venom ER Hospital', action: 'find_hospital' },
        { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Call Emergency Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: language === 'mr' ? '📖 सर्पदंश प्रथमोपचार वाचा' : '📖 Read Full Snake Bite Guide', action: 'read_first_aid', target: 'fa_snake_bite' }
      ]
    };
  }

  if (queryLower.includes('cpr') || queryLower.includes('not breathing') || queryLower.includes('unconscious') || queryLower.includes('बेशुद्ध') || queryLower.includes('श्वास')) {
    return {
      modelUsed,
      severity: 'CRITICAL',
      emergency: true,
      message: language === 'mr'
        ? `🚨 जीवघेणी आणीबाणी: व्यक्ती बेशुद्ध आहे किंवा श्वास घेत नाही.${medicalContextNote} रुग्णवाहिका येईपर्यंत तात्काळ सीपीआर (CPR) सुरू करा!`
        : `🚨 LIFE-THREATENING EMERGENCY: Unresponsive / Cardiac Arrest Event.${medicalContextNote} Begin CPR compressions immediately while emergency services are en route!`,
      steps: language === 'mr' ? [
        'त्वरित 108 किंवा 112 वर कॉल करा किंवा जवळच्या कोणाला कॉल करायला सांगा.',
        'व्यक्तीला सपाट आणि कडक जमिनीवर पाठीवर झोपवा.',
        'हाताचा तळवा छातीच्या मध्यभागी ठेवा आणि बोटे गुंफून घ्या.',
        'वेगाने आणि जोराने (दर मिनिटाला १००-१२० वेळा) छाती दाबा.',
        'प्रत्येक दाब दिल्यानंतर छाती पूर्वस्थितीत येऊ द्या.'
      ] : [
        'Call 112 / 108 immediately or tell someone nearby to call.',
        'Place person on back on a hard, flat floor.',
        'Place heel of hand in center of chest, interlock fingers.',
        'Push hard and fast (100-120 compressions/min) to the rhythm of "Stayin Alive".',
        'Allow chest to recoil fully between compressions.'
      ],
      avoid: language === 'mr' ? [
        'सीपीआर १० सेकंदांपेक्षा जास्त थांबवू नका.',
        'रुग्णवाहिका बोलावण्यास विलंब करू नका.'
      ] : [
        'Do NOT interrupt compressions for more than 10 seconds.',
        'Do NOT delay dispatching emergency services.'
      ],
      suggestedActions: [
        { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Dispatch Ambulance (108 / 112)', action: 'call_emergency', target: '108' },
        { label: language === 'mr' ? '📖 सीपीआर सविस्तर पायऱ्या' : '📖 Visual Step-by-Step CPR Guide', action: 'read_first_aid', target: 'fa_cpr' }
      ]
    };
  }

  if (queryLower.includes('burn') || queryLower.includes('भाजणे')) {
    return {
      modelUsed,
      severity: 'HIGH',
      emergency: true,
      message: language === 'mr'
        ? `🔥 प्रथमोपचार कृती: भाजल्यावरील आपत्कालीन काळजी.${medicalContextNote}`
        : `🔥 FIRST-AID PROTOCOL: Thermal / Chemical Burn Emergency.${medicalContextNote}`,
      steps: language === 'mr' ? [
        'भाजलेल्या भागावर लगेच १० ते २० मिनिटे थंड वाहते पाणी ओता.',
        'सूज येण्यापूर्वी त्या भागातील घड्याळ, अंगठी किंवा घट्ट कपडे काढा.',
        'जखम स्वच्छ निर्जंतुक पट्टीने किंवा स्वच्छ कापडाने हलके झाका.',
        'शक्य असल्यास भाजलेला हात किंवा पाय वरच्या पातळीवर ठेवा.'
      ] : [
        'Cool the burn under cool running tap water for 10 to 20 minutes.',
        'Remove rings or tight clothing near the area before swelling begins.',
        'Cover burn loosely with clean non-stick sterile gauze or plastic wrap.',
        'Elevate burned limb above heart level if possible.'
      ],
      avoid: language === 'mr' ? [
        'बर्फ, बर्फाचे पाणी, लोणी, टूथपेस्ट किंवा तेल लावू नका.',
        'उठलेले फोड फोडू नका.'
      ] : [
        'DO NOT apply ice, ice water, butter, toothpaste, or oil.',
        'DO NOT break or pop blisters.'
      ],
      suggestedActions: [
        { label: language === 'mr' ? '📖 भाजल्यावरील मार्गदर्शिका' : '📖 Open Burns Protocol Guide', action: 'read_first_aid', target: 'fa_burns' },
        { label: language === 'mr' ? '📍 बर्न युनिट रुग्णालय शोधा' : '📍 Find Hospital Burn Unit', action: 'find_hospital' }
      ]
    };
  }

  // General Guidance
  return {
    modelUsed,
    severity,
    emergency: severity !== 'LOW',
    message: language === 'mr'
      ? `नमस्कार! मी आपला फर्स्ट-एड वैद्यकीय सहाय्यक आहे.${medicalContextNote} आपल्या प्रश्नासाठी ("${userQuery}") प्रथमोपचार मार्गदर्शन:`
      : `Hello! I am your AI First-Aid Medical Assistant.${medicalContextNote} Based on standard protocols, here is safety guidance for your query: "${userQuery}".`,
    steps: language === 'mr' ? [
      'परिस्थितीचे मूल्यांकन करा आणि परिसर सुरक्षित असल्याची खात्री करा.',
      'व्यक्तीला तीव्र वेदना, श्वास घेण्यास अडचण किंवा बेशुद्धी असल्यास ताबडतोब 108 किंवा 112 वर कॉल करा.',
      'रुग्णाला शांत व विश्रांतीच्या स्थितीत ठेवा.',
      'आमची प्रथमोपचार मार्गदर्शिका पहा किंवा नकाशावर २४/७ आपत्कालीन रुग्णालय शोधा.'
    ] : [
      'Assess the situation and ensure the environment is safe.',
      'If the person shows severe pain, difficulty breathing, or loss of consciousness, call emergency services (112 / 108 / 911) immediately.',
      'Keep the patient calm, comfortable, and resting.',
      'Browse our verified First-Aid Library or find nearby 24/7 ER hospitals on the map.'
    ],
    avoid: language === 'mr' ? [
      'डॉक्टरांच्या सल्ल्याशिवाय कोणतीही औषधे देऊ नका.',
      'गंभीर लक्षणांकडे दुर्लक्ष करून वैद्यकीय तपासणीस विलंब करू नका.'
    ] : [
      'Do NOT administer unprescribed medications or oral fluids during acute distress.',
      'Do NOT delay professional medical evaluation for severe symptoms.'
    ],
    suggestedActions: [
      { label: language === 'mr' ? '🚨 आपत्कालीन कॉल (108)' : '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '108' },
      { label: language === 'mr' ? '📍 जवळपासची रुग्णालये' : '📍 Find Nearby Hospitals', action: 'find_hospital' },
      { label: language === 'mr' ? '📖 प्रथमोपचार मार्गदर्शिका' : '📖 Read First-Aid Library', action: 'read_first_aid' }
    ]
  };
}

async function callOpenAIAPI(
  prompt: string,
  apiKey: string,
  severity: EmergencySeverity,
  emergency: boolean,
  profile?: MedicalProfile,
  language: 'en' | 'mr' = 'en'
): Promise<AIResponse> {
  const isOpenRouter = apiKey.startsWith('sk-or-v1-');
  const url = isOpenRouter
    ? 'https://openrouter.ai/api/v1/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

  let patientDataPrompt = '';
  if (profile) {
    patientDataPrompt = `\n[PATIENT HEALTH RECORD]\n- Blood Group: ${profile.bloodGroup || 'Not specified'}\n- Known Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}\n- Existing Medical Conditions: ${profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None'}\n- Current Medications: ${profile.medications?.length ? profile.medications.join(', ') : 'None'}\nFactor these specific patient allergies and medical conditions into your first-aid guidance.`;
  }

  const langInstruction = language === 'mr'
    ? 'You MUST reply in fluent, clear Marathi (मराठी). Provide concise bullet points for action steps and what NOT to do.'
    : 'You MUST reply in clear English. Provide concise bullet points for action steps and what NOT to do.';

  const systemPrompt = `You are First Aid Hospital AI, an expert emergency medical assistant. ${langInstruction} Never give a final diagnosis or prescribe prescription drugs. ${patientDataPrompt}`;

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
      { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '108' },
      { label: language === 'mr' ? '📍 जवळचे आपत्कालीन रुग्णालय' : '📍 Find Nearby ER Hospital', action: 'find_hospital' }
    ] : [
      { label: language === 'mr' ? '📖 प्रथमोपचार मार्गदर्शिका' : '📖 Read First-Aid Library', action: 'read_first_aid' }
    ]
  };
}

async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  severity: EmergencySeverity,
  emergency: boolean,
  profile?: MedicalProfile,
  language: 'en' | 'mr' = 'en'
): Promise<AIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  let patientDataPrompt = '';
  if (profile) {
    patientDataPrompt = `\n[PATIENT HEALTH RECORD]\n- Blood Group: ${profile.bloodGroup || 'Not specified'}\n- Known Allergies: ${profile.allergies?.length ? profile.allergies.join(', ') : 'None'}\n- Existing Medical Conditions: ${profile.medicalConditions?.length ? profile.medicalConditions.join(', ') : 'None'}\n- Current Medications: ${profile.medications?.length ? profile.medications.join(', ') : 'None'}\nFactor these specific patient allergies and medical conditions into your guidance.`;
  }

  const langInstruction = language === 'mr'
    ? 'You MUST reply in fluent, clear Marathi (मराठी). Provide concise bullet points for action steps and what NOT to do.'
    : 'You MUST reply in clear English. Provide concise bullet points for action steps and what NOT to do.';

  const systemPrompt = `You are First Aid Hospital AI, a safety-focused emergency medical assistant. ${langInstruction} ${patientDataPrompt}`;

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
      { label: language === 'mr' ? '🚨 रुग्णवाहिका बोलवा (108)' : '🚨 Call Emergency (112 / 108)', action: 'call_emergency', target: '108' },
      { label: language === 'mr' ? '📍 जवळचे रुग्णालय' : '📍 Find Nearby Hospital', action: 'find_hospital' }
    ] : [
      { label: language === 'mr' ? '📖 प्रथमोपचार मार्गदर्शिका' : '📖 Read First-Aid Library', action: 'read_first_aid' }
    ]
  };
}
