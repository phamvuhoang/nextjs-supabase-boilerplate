'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getAllocations } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  List,
  Calendar,
  LayoutGrid,
  Grid,
  Kanban
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_ITEMS_PER_PAGE } from '@/utils/constants';
import { CalendarView } from '@/components/ui/calendar-view';
import { useTenant } from '@/utils/tenant-context';
import { toast } from '@/components/ui/use-toast';
import { HeatmapView } from '@/components/ui/heatmap-view';
import { ProjectHeatmapView } from '@/components/ui/project-heatmap-view';
import { KanbanView } from '../ui/kanban-view';

interface AllocationsPageProps {
  user: User;
}

type ViewMode = 'list' | 'calendar' | 'heatmap' | 'project-heatmap' | 'kanban';

export default function AllocationsPage({ user }: AllocationsPageProps) {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const router = useRouter();
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      loadAllocations();
    }
  }, [currentPage, itemsPerPage, currentTenant]);

  async function loadAllocations() {
    try {
      setLoading(true);
      const supabase = createClient();
      // For calendar view, we don't need pagination
      const { allocations: allocationData, count } = await getAllocations(
        supabase,
        currentTenant!.id,
        viewMode === 'list' ? currentPage : undefined,
        viewMode === 'list' ? itemsPerPage : undefined
      );
      if (allocationData) {
        setAllocations(allocationData);
        setTotalItems(count || 0);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load allocations. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  if (!currentTenant) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold">No Tenant Selected</h2>
          <p className="text-muted-foreground">
            Please select a tenant from your account settings.
          </p>
          <Button className="mt-4" onClick={() => router.push('/account')}>
            Go to Account Settings
          </Button>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'list' ? 'calendar' : 'list';
    setViewMode(newMode);
    if (newMode === 'calendar') {
      loadAllocations(); // Reload without pagination for calendar view
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Allocation List</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              title="List View"
              className={viewMode === 'list' ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
              className={viewMode === 'calendar' ? 'bg-accent' : ''}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('heatmap')}
              title="Employee Heatmap"
              className={viewMode === 'heatmap' ? 'bg-accent' : ''}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('project-heatmap')}
              title="Project Heatmap"
              className={viewMode === 'project-heatmap' ? 'bg-accent' : ''}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('kanban')}
              title="Kanban View"
              className={viewMode === 'kanban' ? 'bg-accent' : ''}
            >
              <Kanban className="h-4 w-4" />
            </Button>
            <Link href="/allocations/add">
              <Button variant="default">+ Add New</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' ? (
            <>
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-muted">
                    <th className="p-2">Employee</th>
                    <th className="p-2">Project</th>
                    <th className="p-2">Start Date</th>
                    <th className="p-2">End Date</th>
                    <th className="p-2">Allocation %</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations?.map((allocation) => (
                    <tr
                      key={allocation.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() =>
                        router.push(`/allocations/edit/${allocation.id}`)
                      }
                    >
                      <td className="p-2">{allocation.employee_name}</td>
                      <td className="p-2">{allocation.project_name}</td>
                      <td className="p-2">
                        {new Date(allocation.start_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {new Date(allocation.end_date).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {allocation.allocation_percentage}%
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/allocations/edit/${allocation.id}`);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          ) : viewMode === 'calendar' ? (
            <CalendarView allocations={allocations} />
          ) : viewMode === 'heatmap' ? (
            <HeatmapView allocations={allocations} />
          ) : viewMode === 'project-heatmap' ? (
            <ProjectHeatmapView allocations={allocations} />
          ) : (
            <KanbanView allocations={allocations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
