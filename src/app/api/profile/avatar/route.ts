import { currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    await dbConnect();

    const dbUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: { avatar: dataUrl } },
      { new: true, runValidators: true }
    );

    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ avatar: dbUser.avatar, success: true });
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return Response.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
