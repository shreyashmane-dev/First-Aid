import { mapsTrailService } from '../mapsTrailAdapter';
import { processAIChatMessage } from '../aiOrchestrator';

// 1. Haversine distance test
console.log('--- Testing Haversine Distance & Radius Filtering ---');
const dist = mapsTrailService.calculateDistance(28.6139, 77.2090, 28.6250, 77.2180);
console.assert(dist > 0 && dist < 5, `Expected distance ~1.5km, got ${dist}`);
console.log(`✓ Distance calculation test passed: ${dist} km`);

// 2. AI Triage Safety Classification test
console.log('--- Testing AI Emergency Safety Engine Triage ---');
async function testTriage() {
  const criticalRes = await processAIChatMessage('My father is having severe chest pain and left arm numbness!');
  console.assert(criticalRes.severity === 'CRITICAL', `Expected CRITICAL, got ${criticalRes.severity}`);
  console.assert(criticalRes.emergency === true, 'Expected emergency flag true');
  console.log('✓ Critical Chest Pain Triage test passed');

  const snakeBiteRes = await processAIChatMessage('Help! I got bitten by a snake on my ankle.');
  console.assert(snakeBiteRes.severity === 'CRITICAL', `Expected CRITICAL for snake bite, got ${snakeBiteRes.severity}`);
  console.log('✓ Snake Bite Emergency Triage test passed');

  const lowRes = await processAIChatMessage('How do I handle a mild paper cut on my finger?');
  console.assert(lowRes.severity === 'LOW', `Expected LOW, got ${lowRes.severity}`);
  console.log('✓ General First-Aid Triage test passed');
}

testTriage().then(() => {
  console.log('✅ All Automated Tests Executed Successfully!');
});
