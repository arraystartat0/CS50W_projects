export async function copyTextToClipboard(text) {
  // Modern API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Async clipboard API failed, falling back...', err);
    }
  }

  // Legacy execCommand fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (successful) return true;
    console.warn('execCommand copy failed');
  } catch (err) {
    console.warn('Fallback copy failed', err);
  }

  // 3. Last‑ditch: prompt the user to copy manually
  window.prompt('Copy to clipboard: Ctrl+C (or ⌘+C), Enter', text);
  return false;
}

export default copyTextToClipboard;
