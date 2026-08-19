/**
 * Thin wrapper around the CRM Widget SDK's global `ZOHO.embeddedApp` object.
 * Every widget must call `init()` once the DOM is ready — CRM won't render
 * the iframe's content (or deliver the record context) until it does.
 */
function init() {
  return new Promise((resolve) => {
    window.ZOHO.embeddedApp.on('PageLoad', (data) => resolve(data));
    window.ZOHO.embeddedApp.init();
  });
}

/** Returns the ID + module of the record the widget is embedded on. */
async function getRecordContext() {
  const data = await init();
  return { entityId: data.EntityId?.[0], module: data.Entity };
}

/** Calls the CRM REST API on the user's behalf, scoped by the widget's connection. */
async function crmApi(path) {
  const response = await window.ZOHO.CRM.CONNECTION.invoke('crm_conn', {
    url: `https://www.zohoapis.com${path}`,
    method: 'GET',
  });
  return JSON.parse(response.details.responseText);
}

export { init, getRecordContext, crmApi };
