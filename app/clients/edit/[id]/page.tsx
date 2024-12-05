import { createClient } from '@/utils/supabase/server';
import { getUser } from '@/utils/supabase/queries';
import AddClientForm from '@/components/misc/AddClientForm';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import ClientProject from '@/components/misc/ClientProject';
import * as Tabs from '@radix-ui/react-tabs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClient({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getUser(supabase);

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout user={user}>
      <div className="w-full flex justify-center">
        <div className="justify-center w-full max-w-2xl">
          <Tabs.Root defaultValue="addClient" className="space-y-4">
            <Tabs.List className="flex space-x-4 border-b border-gray-300 mb-4">
              <Tabs.Trigger
                value="addClient"
                className="px-4 py-2 text-sm font-semibold border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Edit Client
              </Tabs.Trigger>
              <Tabs.Trigger
                value="clientProject"
                className="px-4 py-2 text-sm font-semibold border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Client Project
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content
              value="addClient"
              className="p-4  shadow-lg rounded-md"
            >
              <AddClientForm clientId={id} />
            </Tabs.Content>

            <Tabs.Content
              value="clientProject"
              className="p-4  shadow-lg rounded-md"
            >
              <ClientProject clientId={id} />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </DashboardLayout>
  );
}
