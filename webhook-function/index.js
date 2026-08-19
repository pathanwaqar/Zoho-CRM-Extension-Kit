const crypto = require('crypto');

/**
 * Receives CRM's outgoing webhook when Deal.Stage changes to "Closed Won"
 * (configured in CRM under Setup → Automation → Actions → Webhooks) and
 * forwards a normalized payload to an external system — e.g. a data
 * warehouse, a partner API, or another Zoho Catalyst project.
 */
module.exports = async (event, context) => {
  const rawBody = event.body || JSON.stringify(event);

  if (!verifySignature(rawBody, event.headers?.['x-zoho-signature'], process.env.WEBHOOK_SECRET)) {
    context.closeWithFailure({ error: 'Invalid webhook signature' });
    return;
  }

  const payload = JSON.parse(rawBody);
  const dealId = payload.ids?.[0] || payload.id;

  const normalized = {
    event: 'deal.closed_won',
    source: 'zoho-crm',
    dealId,
    receivedAt: new Date().toISOString(),
  };

  try {
    await forwardToExternalSystem(normalized);
    context.closeWithSuccess();
  } catch (err) {
    console.error('Failed to forward Deal event:', err.message);
    context.closeWithFailure({ error: err.message });
  }
};

async function forwardToExternalSystem(payload) {
  if (!process.env.EXTERNAL_SYSTEM_URL) {
    console.log('[dry-run] Would forward payload:', payload);
    return;
  }

  const res = await fetch(process.env.EXTERNAL_SYSTEM_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`External system responded with ${res.status}`);
  }
}

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signatureHeader);
  return expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
}
