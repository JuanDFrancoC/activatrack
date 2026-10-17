import { handlers } from '@/lib/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = handlers.health;
