import { auth, currentUser } from '@clerk/nextjs/server';
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
      const { userId } = await auth();
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      clerkId = userId;
    }

    await dbConnect();

    let dbUser = await User.findOne({ clerkId });

    if (!dbUser) {
      // Create user with starting stats if not found in MongoDB
      if (isClerkConfigured) {
        const user = await currentUser();
        if (user) {
          name = user.fullName || user.firstName || 'Explorer';
          email = user.emailAddresses[0]?.emailAddress || '';
          avatar = user.imageUrl || '';
        }
      }

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
    console.error('Error fetching/syncing profile (using mock/Clerk fallback):', error);
    
    let fallbackName = name;
    let fallbackEmail = email;
    let fallbackAvatar = avatar;
    
    if (isClerkConfigured) {
      try {
        const user = await currentUser();
        if (user) {
          fallbackName = user.fullName || user.firstName || 'Explorer';
          fallbackEmail = user.emailAddresses[0]?.emailAddress || '';
          fallbackAvatar = user.imageUrl || '';
        }
      } catch (clerkErr) {
        console.error('Failed to fetch Clerk user in database fallback:', clerkErr);
      }
    }

    return Response.json({
      clerkId,
      name: fallbackName,
      email: fallbackEmail,
      avatar: fallbackAvatar,
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
      socialLinks: { github: '', linkedin: '', website: '' },
      privacy: { publicProfile: true, showStreak: true, showXP: true }
    });
  }
}

export async function POST(request: Request) {
  try {
    const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
    let clerkId = 'mock_user_id';

    if (isClerkConfigured) {
      const { userId } = await auth();
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      clerkId = userId;
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
