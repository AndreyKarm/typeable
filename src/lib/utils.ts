import toast from 'svelte-5-french-toast';

export async function copyToClipboard(text: string | number) {
  try {
    await navigator.clipboard.writeText(text.toString());
    toast.success('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);
    toast.error('Failed to copy to clipboard.');
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));