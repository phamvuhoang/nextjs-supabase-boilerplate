'use client';
import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import { toast } from '../ui/use-toast';

type Project = {
  id: string;
  name: string;
  code: string;
  deal_status: string;
  start_date: string;
  end_date: string;
  currency: string;
  contract_owner: string;
  engagement_manager_email: string;
  billable: boolean;
};

type ClientProjectProps = {
  clientId: string;
};

const ClientProject: React.FC<ClientProjectProps> = ({ clientId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Projects')
          .select(
            'id, name, code, deal_status, start_date, end_date, currency, contract_owner, engagement_manager_email, billable'
          )
          .eq('client_id', clientId);
        if (error) {
          throw error;
        }

        setProjects(data || []);
        setLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects. Please try again.',
          variant: 'destructive'
        });
        setError('Error loading projects');
        setLoading(false);
      }
    };

    if (clientId) {
      loadProjects();
    }
  }, [clientId]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl">
      <div className="flex-1 p-8">
        {projects.length === 0 ? (
          <p className="text-center">No projects found for this client.</p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 shadow-lg rounded-md border "
              >
                <h3 className="text-2xl font-semibold">{project.name}</h3>
                <p className="">
                  <strong>Code:</strong> {project.code}
                </p>
                <p className="">
                  <strong>Status:</strong>{' '}
                  <span
                    className={`bg-${project.deal_status === 'WON' ? 'green' : 'yellow'}-100 text-${project.deal_status === 'WON-100' ? 'green-100' : 'black'} text-xs font-medium px-2 py-1 rounded`}
                  >
                    {project.deal_status}
                  </span>
                </p>
                <p className="">
                  <strong>Currency:</strong> {project.currency}
                </p>
                <p className="">
                  <strong>Contract Owner:</strong> {project.contract_owner}
                </p>
                <p className="">
                  <strong>Engagement Manager Email:</strong>{' '}
                  {project.engagement_manager_email}
                </p>
                <p className="">
                  <strong>Billable:</strong> {project.billable ? 'Yes' : 'No'}
                </p>
                <p className="">
                  <strong>Start Date:</strong>{' '}
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
                <p className="">
                  <strong>End Date:</strong>{' '}
                  {new Date(project.end_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProject;
