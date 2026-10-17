import { ActivityDetail } from '@/components/activity-detail';
export const metadata = { title: 'Detalle de actividad' };
export default async function DetailPage({ params }) {
  const { id } = await params;
  return <ActivityDetail id={id} />;
}
