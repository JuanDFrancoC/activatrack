import { ActivityForm } from '@/components/activity-form';
export const metadata = { title: 'Editar actividad' };
export default async function EditPage({ params }) {
  const { id } = await params;
  return <ActivityForm id={id} />;
}
