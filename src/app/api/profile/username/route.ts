import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username) {
      return Response.json({ error: 'Username parameter is required' }, { status: 400 });
    }

    // Basic alphanumeric regex check
    const isValidFormat = /^[a-zA-Z0-9_]{3,15}$/.test(username);
    if (!isValidFormat) {
      return Response.json({
        available: false,
        reason: 'Username must be 3-15 characters and contain only letters, numbers, and underscores.'
      });
    }

    // Get current user to exclude self check
    const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
    let currentClerkId = 'mock_user_id';
    if (isClerkConfigured) {
      const user = await currentUser();
      if (user) {
        currentClerkId = user.id;
      }
    }

    await dbConnect();

    // Check if username taken by another user
    const existingUser = await User.findOne({
      username,
      clerkId: { $ne: currentClerkId }
    });

    if (existingUser) {
      // Suggest options
      const suggestions = [
        `${username}_astro`,
        `${username}_quest`,
        `${username}_stargazer`,
        `orbit_${username}`
      ];
      return Response.json({
        available: false,
        reason: 'Username is already taken by another explorer.',
        suggestions
      });
    }

    return Response.json({ available: true });
  } catch (error: any) {
    console.error('Username check error:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
