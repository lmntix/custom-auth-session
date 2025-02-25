'use server';

export async function testaction(_: unknown, formData: FormData) {
  const text = formData.get('text') as string;

  if (!text) {
    return { error: 'Text is required' };
  }

  if (text.length < 4) {
    return { error: 'Text must be at least 4 characters long' };
  }

  try {
    // Process the text here
    return { success: true };
  } catch (error) {
    return { error: 'Failed to process text' };
  }
}
