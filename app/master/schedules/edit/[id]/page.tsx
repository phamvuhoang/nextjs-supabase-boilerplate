import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddWorkScheduleTypeForm from '@/components/misc/AddWorkScheduleTypeForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkScheduleType({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser(supabase);
  
  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <AddWorkScheduleTypeForm scheduleTypeId={id} />
    </DashboardLayout>
  );
} 