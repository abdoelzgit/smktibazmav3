import { timingSafeEqual } from 'node:crypto';
import { processPpdbSheetSyncQueue } from '@/lib/ppdb-google-sheets';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization') ?? '';
  const suppliedSecret = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!secret || suppliedSecret.length !== secret.length
    || !timingSafeEqual(Buffer.from(suppliedSecret), Buffer.from(secret))) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processPpdbSheetSyncQueue();
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('PPDB Google Sheets queue failed:', error);
    return Response.json({ success: false, error: 'Google Sheets sync failed.' }, { status: 500 });
  }
}
