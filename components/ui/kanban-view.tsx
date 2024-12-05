'use client';
import { Card } from '@/components/ui/card';
import { Chart } from 'react-google-charts';

interface Employee {
  surname: string;
  given_name: string;
}

interface Project {
  code: string;
  name: string;
}

interface Allocation {
  id: string;
  employee_id: string;
  project_id: string;
  start_date: string;
  end_date: string;
  allocation_percentage: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  tenant_id: string;
  Employees: Employee;
  Projects: Project;
}

interface KanbanViewProps {
  allocations: Allocation[];
}

export function KanbanView({ allocations }: KanbanViewProps) {
  console.log(allocations);
  const projectColors: { [key: string]: string } = {};
  const colors = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#4363d8',
    '#f58231',
    '#911eb4',
    '#42d4f4',
    '#f032e6',
    '#bfef45',
    '#fabebe'
  ];
  let colorIndex = 0;
  console.log(allocations);
  const chartData = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' }
    ],
    ...allocations.map((allocation) => {
      if (!projectColors[allocation.project_id]) {
        projectColors[allocation.project_id] = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
      }
      return [
        allocation.id,
        `${allocation.Employees.given_name} ${allocation.Employees.surname}`,
        allocation.Projects.name,
        new Date(allocation.start_date),
        new Date(allocation.end_date),
        null,
        allocation.allocation_percentage,
        null
      ];
    })
  ];

  const chartOptions = {
    height: 400,
    gantt: {
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: '#e64a19',
        strokeWidth: 2
      },
      arrow: {
        angle: 100,
        width: 5,
        color: 'green',
        radius: 0
      },
      palette: Object.values(projectColors)
    }
  };

  return (
    <Card>
      <Chart
        chartType="Gantt"
        width="100%"
        height="100%"
        data={chartData}
        options={chartOptions}
      />
    </Card>
  );
}
