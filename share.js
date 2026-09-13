/* Equals — share.js
   URL shortener integration (graceful fallback).
   The Cloudflare Worker shortener is currently offline,
   so this tries to shorten but silently succeeds with
   the long URL if the shortener is unavailable. */
(() => {
  const workerUrl = "https://rapid-cake-db1equals-shortener.chandanyadav96.workers.dev";
  const button = document.getElementById("share");
  const toast = document.getElementById("toast");
  if (!button || !toast) return;

  const show = message => {
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(window.equalsShareToast);
    window.equalsShareToast = setTimeout(() => toast.classList.add("hidden"), 3000);
  };

  // Store the original onclick (which copies the long URL)
  const legacyShare = button.onclick;

  button.onclick = async () => {
    // First: always copy the long URL via the legacy handler
    if (typeof legacyShare === 'function') {
      legacyShare.call(button);
    }

    // Then: try to shorten (non-blocking, best-effort)
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Copying…";
    try {
      const url = await navigator.clipboard.readText();
      if (!url || !url.includes('#trip=')) throw new Error('No trip URL');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const result = await response.json();
      if (response.ok && result.shortUrl) {
        await navigator.clipboard.writeText(result.shortUrl);
        show("Short link copied! ✓");
      } else {
        // Shortener failed but long URL is already in clipboard
        show("Share link copied! ✓");
      }
    } catch {
      // Shortener unreachable — long URL already in clipboard from legacyShare
      show("Share link copied! ✓");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  };
})();
