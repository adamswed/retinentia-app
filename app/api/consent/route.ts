import { NextResponse } from 'next/server';
import { createUserConsent } from '@/actions/register';

export async function POST(req: Request) {
  try {
    const { userId, agreedAt } = await req.json();

    // Validate inputs
    if (!userId || !agreedAt) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or agreedAt' },
        { status: 400 }
      );
    }

    const result = await createUserConsent(userId, agreedAt);

    if (!result.success) {
      console.error('[Consent API] Failed to create consent:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to store consent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Consent API] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
