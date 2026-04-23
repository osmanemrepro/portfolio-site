import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromToken } from '@/lib/admin';

// GET /api/contact - Get all contact messages
export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/contact - Create message or perform actions (mark_read, delete)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, name, email, message } = body;

    // Admin actions
    if (action === 'mark_read') {
      const admin = await getAdminFromToken(request);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!id) {
        return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
      }

      await db.contactMessage.update({
        where: { id },
        data: { read: true },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      const admin = await getAdminFromToken(request);
      if (!admin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!id) {
        return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
      }

      await db.contactMessage.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    // Public contact form submission
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, message },
    });

    return NextResponse.json(contactMessage, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
