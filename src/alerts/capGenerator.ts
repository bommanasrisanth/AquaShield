/**
 * Common Alerting Protocol (CAP v1.2) Generator
 * Standards-compliant XML and JSON broadcast payload generator for emergency authorities.
 * OASIS CAP v1.2 Specification reference.
 */

import { CAPAlert } from '../types';

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an OASIS CAP v1.2 compliant XML string
 */
export function generateCAP12Xml(alert: CAPAlert): string {
  const sentFormatted = alert.sent || new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${escapeXml(alert.identifier)}</identifier>
  <sender>${escapeXml(alert.sender)}</sender>
  <sent>${escapeXml(sentFormatted)}</sent>
  <status>${escapeXml(alert.status)}</status>
  <msgType>${escapeXml(alert.msgType)}</msgType>
  <scope>${escapeXml(alert.scope)}</scope>
  <info>
    <category>${escapeXml(alert.category)}</category>
    <event>${escapeXml(alert.event)}</event>
    <urgency>${escapeXml(alert.urgency)}</urgency>
    <severity>${escapeXml(alert.severity)}</severity>
    <certainty>${escapeXml(alert.certainty)}</certainty>
    <headline>${escapeXml(alert.headline)}</headline>
    <description>${escapeXml(alert.description)}</description>
    <instruction>${escapeXml(alert.instruction)}</instruction>
    <area>
      <areaDesc>${escapeXml(alert.areaDesc)}</areaDesc>
      ${alert.circleCoordinates ? `<circle>${escapeXml(alert.circleCoordinates)}</circle>` : ''}
    </area>
  </info>
</alert>`.trim();
}

/**
 * Generates a standard CAP JSON object
 */
export function generateCAP12Json(alert: CAPAlert): object {
  return {
    $schema: 'https://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.json',
    alert: {
      identifier: alert.identifier,
      sender: alert.sender,
      sent: alert.sent,
      status: alert.status,
      msgType: alert.msgType,
      scope: alert.scope,
      info: [
        {
          category: [alert.category],
          event: alert.event,
          urgency: alert.urgency,
          severity: alert.severity,
          certainty: alert.certainty,
          headline: alert.headline,
          description: alert.description,
          instruction: alert.instruction,
          area: [
            {
              areaDesc: alert.areaDesc,
              circle: alert.circleCoordinates,
            },
          ],
        },
      ],
    },
  };
}

/**
 * Formats a short emergency broadcast SMS / Cell Broadcast message (under 160 characters)
 */
export function formatCellBroadcastMessage(event: string, headline: string, action: string): string {
  const text = `EMERGENCY ALERT: ${event}. ${headline}. Action: ${action} - Auth: AquaShield / Disaster Dept`;
  return text.slice(0, 160);
}
