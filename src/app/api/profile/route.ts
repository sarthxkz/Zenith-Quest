import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

export async function GET() {
  try {
    // Check if Clerk keys are configured
    const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
    
    let clerkId = 'mock_user_id';
    let name = 'Cosmic Explorer';
    let email = 'explorer@zenithquest.com';
    let avatar = '';

    if (isClerkConfigured) {
      const user = await currentUser();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      clerkId = user.id;
      name = user.fullName || user.firstName || 'Explorer';
      email = user.emailAddresses[0]?.emailAddress || '';
      avatar = user.imageUrl || '';
    }

    await dbConnect();

    let dbUser = await User.findOne({ clerkId });

    if (!dbUser) {
      // Create user with starting stats if not found in MongoDB
      dbUser = await User.create({
        clerkId,
        name,
        email,
        avatar,
        xp: 1250,
        level: 5,
        rank: 'Night Watcher',
        totalObservations: 23,
        completedMissions: 8,
        currentStreak: 7,
        longestStreak: 14,
        badges: [],
        achievements: [],
        favoriteLocations: [],
        observationHistory: [],
        activeMissions: [],
      });
    }

    return Response.json(dbUser);
  } catch (error: any) {
    console.error('Error fetching/syncing profile:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
    let clerkId = 'mock_user_id';

    if (isClerkConfigured) {
      const user = await currentUser();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      clerkId = user.id;
    }

    const body = await request.json();
    await dbConnect();

    const dbUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(dbUser);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
