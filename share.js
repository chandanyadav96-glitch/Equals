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
  const legacyShare = button.onclick;
  button.onclick = async () => {
    const label = button.textContent;
    button.disabled = true;
    button.textContent = "Shortening…";
    try {
      legacyShare.call(button);
      const url = await navigator.clipboard.readText();
      const response = await fetch(workerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      if (!response.ok || !result.shortUrl) throw new Error();
      await navigator.clipboard.writeText(result.shortUrl);
      show("Short link copied");
    } catch {
      show("Couldn’t shorten this link. Please try again.");
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  };
})();
