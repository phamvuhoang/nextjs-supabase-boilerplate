'use client';

import { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { getWorkLogs } from '@/utils/supabase/queries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Settings,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { DEFAULT_ITEMS_PER_PAGE } from '@/utils/constants';
import { useTenant } from '@/utils/tenant-context';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isWeekend,
  isSameMonth,
  isToday
} from 'date-fns';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import BulkImportWorkLogs from '@/components/misc/BulkImportWorkLogs';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { approveWorkLog, rejectWorkLog } from '@/utils/supabase/queries';

interface WorkLog {
  id: string;
  employee_name: string;
  schedule_type_name: string;
  schedule_type_multiplier: number;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  description: string;
  status: string;
  approver_name: string | null;
}

interface WorkLogsPageProps {
  user: User;
}

type ViewMode = 'list' | 'week' | 'month';

// Constants for week view
const WEEK_VIEW_SINGLE_ROW_LIMIT = 10;
const WEEK_VIEW_MAX_CIRCLES = 50;

// Constants for month view
const MONTH_VIEW_SINGLE_ROW_LIMIT = 3;
const MONTH_VIEW_MAX_CIRCLES = 15;

export default function WorkLogsPage({ user }: WorkLogsPageProps) {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const router = useRouter();
  const { currentTenant } = useTenant();
  console.log(workLogs);
  useEffect(() => {
    if (currentTenant) {
      loadWorkLogs();
    }
  }, [currentPage, itemsPerPage, currentTenant, currentDate, viewMode]);
  const exportToCSV = (workLogs: WorkLog[]) => {
    if (!workLogs.length) {
      toast({
        title: 'No Data',
        description: 'There are no work logs to export.'
      });
      return;
    }

    const headers = [
      'ID',
      'Employee Name',
      'Schedule Type Name',
      'Schedule Multiplier',
      'Date',
      'Start Time',
      'End Time',
      'Break Duration',
      'Description',
      'Status',
      'Approver Name'
    ];

    const rows = workLogs.map((log) => [
      log.id,
      log.employee_name,
      log.schedule_type_name,
      log.schedule_type_multiplier,
      log.date,
      log.start_time,
      log.end_time,
      log.break_duration,
      log.description,
      log.status,
      log.approver_name || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work_logs_${viewMode}_${currentTenant?.name}_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  async function loadWorkLogs() {
    try {
      setLoading(true);
      const supabase = createClient();

      let startDate, endDate;
      if (viewMode === 'week') {
        startDate = format(startOfWeek(currentDate), 'yyyy-MM-dd');
        endDate = format(endOfWeek(currentDate), 'yyyy-MM-dd');
      } else if (viewMode === 'month') {
        startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
        endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      }

      const { workLogs: data, count } = await getWorkLogs(
        supabase,
        currentTenant!.id,
        undefined,
        startDate,
        endDate,
        viewMode === 'list' ? currentPage : undefined,
        viewMode === 'list' ? itemsPerPage : undefined
      );
      if (data) {
        setWorkLogs(data);
        setTotalItems(count || 0);
      }
    } catch (error) {
      console.error('Error loading work logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load work logs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge variant="default">{status}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateDuration = (
    startTime: string,
    endTime: string,
    breakDuration: number
  ) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const durationInMinutes =
      (end.getTime() - start.getTime()) / 1000 / 60 - breakDuration;
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = Math.round(durationInMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const handleApprove = async (workLogId: string) => {
    try {
      const supabase = createClient();
      await approveWorkLog(supabase, workLogId, user.id);
      toast({
        title: 'Success',
        description: 'Work log approved successfully.'
      });
      loadWorkLogs();
    } catch (error) {
      console.error('Error approving work log:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve work log. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (workLogId: string) => {
    try {
      const supabase = createClient();
      await rejectWorkLog(supabase, workLogId, user.id);
      toast({
        title: 'Success',
        description: 'Work log rejected successfully.'
      });
      loadWorkLogs();
    } catch (error) {
      console.error('Error rejecting work log:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject work log. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderActionButtons = (log: WorkLog) => {
    if (log.status === 'pending') {
      return (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(log.id);
            }}
            className="text-green-600 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleReject(log.id);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    }
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/work-logs/edit/${log.id}`);
        }}
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  };

  const getMonthStartDays = (date: Date) => {
    const start = startOfMonth(date);
    const day = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const emptyDays = Array(day).fill(null);
    return emptyDays;
  };

  const getWeekStartDays = (date: Date) => {
    const start = startOfWeek(date);
    const day = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const emptyDays = Array(day).fill(null);
    return emptyDays;
  };

  const days = useMemo(() => {
    const start =
      viewMode === 'week'
        ? startOfWeek(currentDate)
        : startOfMonth(currentDate);
    const end =
      viewMode === 'week' ? endOfWeek(currentDate) : endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate((prev) =>
        direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
      );
    } else if (viewMode === 'month') {
      setCurrentDate((prev) =>
        direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
      );
    }
  };

  const renderDayLogs = (dayLogs: WorkLog[]) => {
    const isWeekView = viewMode === 'week';
    const singleRowLimit = isWeekView
      ? WEEK_VIEW_SINGLE_ROW_LIMIT
      : MONTH_VIEW_SINGLE_ROW_LIMIT;
    const maxCircles = isWeekView
      ? WEEK_VIEW_MAX_CIRCLES
      : MONTH_VIEW_MAX_CIRCLES;

    if (dayLogs.length <= singleRowLimit) {
      // Single row layout
      return (
        <div className="space-y-1">
          {dayLogs.map((log) => (
            <div
              key={log.id}
              className="mb-2 p-2 bg-card rounded cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/work-logs/edit/${log.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm">{log.employee_name}</div>
                {getStatusBadge(log.status)}
              </div>
              <div className="text-xs text-muted-foreground">
                {log.start_time} - {log.end_time}
              </div>
              <div className="text-xs">
                {log.schedule_type_name} ({log.schedule_type_multiplier}x)
              </div>
              <div className="flex justify-end mt-1">
                {renderActionButtons(log)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Circle layout for many logs
    const displayCount = Math.min(dayLogs.length, maxCircles);
    const hasMore = dayLogs.length > maxCircles;
    const remainingCount = dayLogs.length - maxCircles;

    return (
      <div>
        <div className="flex flex-wrap gap-1">
          {dayLogs.slice(0, displayCount).map((log) => (
            <div
              key={log.id}
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer',
                log.status === 'approved'
                  ? 'bg-green-200 dark:bg-green-900/50'
                  : log.status === 'rejected'
                    ? 'bg-red-200 dark:bg-red-900/50'
                    : 'bg-yellow-200 dark:bg-yellow-900/50'
              )}
              onClick={() => router.push(`/work-logs/edit/${log.id}`)}
              title={`${log.employee_name} (${log.start_time} - ${log.end_time})`}
            >
              {log.employee_name.charAt(0).toUpperCase()}
            </div>
          ))}
          {hasMore && (
            <div
              className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs cursor-pointer"
              title={`${remainingCount} more work logs`}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  };

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

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle>Work Logs</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {viewMode === 'month'
                  ? format(currentDate, 'MMMM yyyy')
                  : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Bulk Import</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogTitle>Import Work Logs</DialogTitle>
                <BulkImportWorkLogs
                  onComplete={() => {
                    loadWorkLogs();
                  }}
                />
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-accent' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-accent' : ''}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-accent' : ''}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              onClick={() => exportToCSV(workLogs)}
              disabled={loading || !workLogs.length}
            >
              Export to CSV
            </Button>
            <Link href="/work-logs/add">
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
                    <th className="p-2">Date</th>
                    <th className="p-2">Schedule Type</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workLogs?.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => router.push(`/work-logs/edit/${log.id}`)}
                    >
                      <td className="p-2">{log.employee_name}</td>
                      <td className="p-2">
                        {format(new Date(log.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="p-2">
                        {log.schedule_type_name} ({log.schedule_type_multiplier}
                        x)
                      </td>
                      <td className="p-2">
                        {log.start_time} - {log.end_time}
                      </td>
                      <td className="p-2">
                        {calculateDuration(
                          log.start_time,
                          log.end_time,
                          log.break_duration
                        )}
                      </td>
                      <td className="p-2">{getStatusBadge(log.status)}</td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/work-logs/edit/${log.id}`);
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
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    'text-center font-medium py-2',
                    (index === 0 || index === 6) && 'text-red-500'
                  )}
                >
                  {day}
                </div>
              ))}

              {(viewMode === 'month'
                ? getMonthStartDays(currentDate)
                : getWeekStartDays(currentDate)
              ).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="min-h-[120px] bg-muted/50"
                />
              ))}

              {days.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayLogs = workLogs.filter(
                  (log) => format(new Date(log.date), 'yyyy-MM-dd') === dateKey
                );

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      'min-h-[120px] p-2 border rounded-lg',
                      !isSameMonth(day, currentDate) &&
                        viewMode === 'month' &&
                        'bg-muted/50',
                      isToday(day) && 'border-primary',
                      isWeekend(day) && 'bg-gray-50 dark:bg-gray-800/30',
                      'dark:border-zinc-700'
                    )}
                  >
                    <div
                      className={cn(
                        'text-right text-sm mb-2',
                        isWeekend(day) && 'text-red-500'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    {renderDayLogs(dayLogs)}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
