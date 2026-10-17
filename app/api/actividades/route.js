import { handlers } from '@/lib/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = handlers.list;
export const POST = handlers.create;
