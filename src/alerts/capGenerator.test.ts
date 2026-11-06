import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCAP12Xml, generateCAP12Json, formatCellBroadcastMessage } from './capGenerator';
import { CAPAlert } from '../types';

const sampleAlert: CAPAlert = {
  identifier: 'AQUASHIELD-2026-001',
  sender: 'authorities@aquashield.org',
  sent: '2026-11-06T12:00:00Z',
  status: 'Actual',
  msgType: 'Alert',
  scope: 'Public',
  category: 'Met',
  event: 'Flash Flood Warning',
  urgency: 'Immediate',
  severity: 'Extreme',
  certainty: 'Observed',
  headline: 'Severe Krishna River surge approaching Prakasam Barrage',
  description: 'Water level reached 8.2m upstream. Low-lying areas must evacuate.',
  instruction: 'Evacuate immediately to municipal flood shelters.',
  areaDesc: 'Vijayawada low-lying riverbanks, Bhavanipuram, Krishnalanka',
  circleCoordinates: '16.5062,80.6480,10.0',
};

test('generateCAP12Xml generates valid OASIS namespace and XML nodes', () => {
  const xml = generateCAP12Xml(sampleAlert);
  assert.ok(xml.includes('urn:oasis:names:tc:emergency:cap:1.2'));
  assert.ok(xml.includes('<identifier>AQUASHIELD-2026-001</identifier>'));
  assert.ok(xml.includes('<severity>Extreme</severity>'));
  assert.ok(xml.includes('<circle>16.5062,80.6480,10.0</circle>'));
});

test('generateCAP12Json generates compliant JSON tree', () => {
  const json: any = generateCAP12Json(sampleAlert);
  assert.equal(json.alert.identifier, 'AQUASHIELD-2026-001');
  assert.equal(json.alert.info[0].severity, 'Extreme');
});

test('formatCellBroadcastMessage enforces under 160 character limit for telecom networks', () => {
  const sms = formatCellBroadcastMessage(
    'Flash Flood Warning',
    'Severe Krishna River surge approaching Prakasam Barrage',
    'Evacuate immediately'
  );
  assert.ok(sms.length <= 160);
  assert.ok(sms.startsWith('EMERGENCY ALERT:'));
});
