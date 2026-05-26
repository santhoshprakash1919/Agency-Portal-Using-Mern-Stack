const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

export function startKeepAlive() {
  setInterval(async () => {
    try {
      await fetch(`${BACKEND_URL}/api/health`);
      console.log('[KeepAlive] Pinged at', new Date().toISOString());
    } catch (err) {
      console.error('[KeepAlive] Failed:', err.message);
    }
  }, 14 * 60 * 1000); // every 14 minutes
}
