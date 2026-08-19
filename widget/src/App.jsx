import React, { useEffect, useState } from 'react';
import { getRecordContext, crmApi } from './zohoEmbed.js';

/**
 * Rendered inside a Deal record page (registered as a "Related List" or
 * "Detail View" widget in CRM's widget config). Shows related Desk tickets
 * and the Deal's last activity, entirely via CRM REST API calls made
 * client-side through the widget's own connection — no separate backend
 * needed for this widget.
 */
export default function App() {
  const [deal, setDeal] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { entityId, module } = await getRecordContext();
        if (module !== 'Deals') return;

        const dealData = await crmApi(`/crm/v6/Deals/${entityId}`);
        setDeal(dealData.data[0]);

        // Desk_Ticket_Ids is a multi-line/lookup custom field on Deals
        // populated by notifyDealWon.dg / an external sync — kept simple
        // here as a comma-separated field for the widget's own lookup.
        const ticketIds = (dealData.data[0].Desk_Ticket_Ids || '').split(',').filter(Boolean);
        const ticketResults = await Promise.all(
          ticketIds.map((id) => crmApi(`/crm/v6/functions/getDeskTicket/actions/execute?ticketId=${id}`))
        );
        setTickets(ticketResults.map((r) => r.details));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!deal) return <p>Loading deal health…</p>;

  return (
    <div className="panel">
      <h3>{deal.Deal_Name}</h3>
      <p>Stage: <strong>{deal.Stage}</strong> · Amount: ${deal.Amount}</p>
      <h4>Related Support Tickets</h4>
      {tickets.length === 0 && <p className="muted">No related tickets</p>}
      <ul>
        {tickets.map((t, i) => (
          <li key={i}>
            [{t.status}] {t.subject}
          </li>
        ))}
      </ul>
    </div>
  );
}
