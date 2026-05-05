import toast from 'svelte-5-french-toast';

// Copy text to clipboard
export async function copyToClipboard(text: string | number) {
  try {
    await navigator.clipboard.writeText(text.toString());
    toast.success('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);
    toast.error('Failed to copy to clipboard.');
  }
}

// Sleep for a specified amount of time
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));