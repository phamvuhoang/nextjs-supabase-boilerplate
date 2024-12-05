import { SupabaseClient } from '@supabase/supabase-js';

export const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
};

export async function getEmployees(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number,
  departmentId?: string,
  isActive?: boolean,
  search?: string
) {
  let query = supabase
    .from('Employees')
    .select(
      `*,
      departments:EmployeeDepartments(
        department:Departments(*)
      ),
      contracts:EmployeeContracts(
        id,
        start_date,
        end_date,
        position:Positions(title)
      )`,
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('surname', { ascending: true });

  if (departmentId?.trim()) {
    query = query.eq('EmployeeDepartments.department_id', departmentId);
  }
  if (isActive !== undefined && isActive !== null) {
    query = query.eq('is_active', isActive);
  }
  if (search) {
    query = query.or(
      `given_name.ilike.%${search}%,surname.ilike.%${search}%,personal_email.ilike.%${search}%,company_email.ilike.%${search}`
    );
  }
  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: employees, error, count } = await query;

  if (error) {
    console.error('Error fetching employees:', error);
    return { employees: null, count: 0 };
  }

  return { employees, count };
}

export async function getEmployee(supabase: SupabaseClient, id: string) {
  const { data: employee, error } = await supabase
    .from('Employees')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching employee:', error);
    return null;
  }

  return employee;
}

export async function addEmployee(supabase: SupabaseClient, employeeData: any) {
  const { data, error } = await supabase
    .from('Employees')
    .insert([
      {
        ...employeeData,
        is_deleted: false
      }
    ])
    .select();

  if (error) {
    console.error('Error adding employee:', error);
    throw error;
  }

  return data;
}

export async function updateEmployee(
  supabase: SupabaseClient,
  employeeData: any
) {
  const { data, error } = await supabase
    .from('Employees')
    .update([
      {
        ...employeeData,
        updated_at: new Date().toISOString()
      }
    ])
    .eq('id', employeeData.id)
    .select();

  if (error) {
    console.error('Error updating employee:', error);
    throw error;
  }

  return data;
}

export async function getClients(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Clients')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: clients, error, count } = await query;

  if (error) {
    console.error('Error fetching clients:', error);
    return { clients: null, count: 0 };
  }

  return { clients, count };
}

export async function getClient(supabase: SupabaseClient, id: string) {
  const { data: client, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    return null;
  }

  return client;
}

export async function addClient(supabase: SupabaseClient, clientData: any) {
  const { data, error } = await supabase
    .from('Clients')
    .insert([clientData])
    .select();

  if (error) {
    console.error('Error adding client:', error);
    throw error;
  }

  return data;
}

export async function updateClient(supabase: SupabaseClient, clientData: any) {
  const { data, error } = await supabase
    .from('Clients')
    .update([clientData])
    .eq('id', clientData.id)
    .select();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  return data;
}

export async function getProjects(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Projects')
    .select('*, Clients(name)', { count: 'exact' })
    // .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: projects, error, count } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return { projects: null, count: 0 };
  }

  const projectsWithClientName = projects?.map((project) => ({
    ...project,
    client_name: project.Clients ? project.Clients.name : 'Unknown Client'
  }));

  return { projects: projectsWithClientName, count };
}

export async function getProject(supabase: SupabaseClient, id: string) {
  const { data: project, error } = await supabase
    .from('Projects')
    .select('*')
    .eq('id', id)
    // .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return project;
}

export async function addProject(supabase: SupabaseClient, projectData: any) {
  const { data, error } = await supabase
    .from('Projects')
    .insert([projectData])
    .select();

  if (error) {
    console.error('Error adding project:', error);
    throw error;
  }

  return data;
}

export async function updateProject(
  supabase: SupabaseClient,
  projectData: any
) {
  const { data, error } = await supabase
    .from('Projects')
    .update([projectData])
    .eq('id', projectData.id)
    .select();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  return data;
}

// Add a new function specifically for searching clients
export async function searchClients(
  supabase: SupabaseClient,
  searchTerm: string
) {
  const { data: clients, error } = await supabase
    .from('Clients')
    .select('*')
    .eq('is_deleted', false)
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error searching clients:', error);
    return null;
  }

  return clients;
}

export async function getAllocations(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Allocations')
    .select(
      `
      *,
      Employees(given_name, surname),
      Projects(name, code)
    `,
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('start_date', { ascending: false });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: allocations, error, count } = await query;

  if (error) {
    console.error('Error fetching allocations:', error);
    return { allocations: null, count: 0 };
  }

  const formattedAllocations = allocations?.map((allocation) => ({
    ...allocation,
    employee_name: `${allocation.Employees.given_name} ${allocation.Employees.surname}`,
    project_name: `${allocation.Projects.code} - ${allocation.Projects.name}`
  }));

  return { allocations: formattedAllocations, count };
}

export async function getAllocation(supabase: SupabaseClient, id: string) {
  // First, get the basic allocation data
  const { data: allocation, error: allocationError } = await supabase
    .from('Allocations')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (allocationError) {
    console.error('Error fetching allocation:', allocationError);
    return null;
  }

  // Then get the employee and project details separately
  const { data: employee } = await supabase
    .from('Employees')
    .select('given_name, surname')
    .eq('id', allocation.employee_id)
    .single();

  const { data: project } = await supabase
    .from('Projects')
    .select('name, code')
    .eq('id', allocation.project_id)
    .single();

  return {
    ...allocation,
    Employees: employee,
    Projects: project
  };
}

export async function addAllocation(
  supabase: SupabaseClient,
  allocationData: any
) {
  const { data, error } = await supabase
    .from('Allocations')
    .insert([
      {
        ...allocationData,
        is_deleted: false
      }
    ])
    .select();

  if (error) {
    console.error('Error adding allocation:', error);
    throw error;
  }

  return data;
}

export async function updateAllocation(
  supabase: SupabaseClient,
  allocationData: any
) {
  // Remove nested objects before update
  const { Employees, Projects, employee_name, project_name, ...updateData } =
    allocationData;

  const { data, error } = await supabase
    .from('Allocations')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', updateData.id)
    .select();

  if (error) {
    console.error('Error updating allocation:', error);
    throw error;
  }

  return data;
}

export async function getUserTenants(supabase: SupabaseClient, userId: string) {
  const { data: userTenants, error } = await supabase
    .from('UserTenants')
    .select(
      `
      *,
      tenant:Tenants(*)
    `
    )
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user tenants:', error);
    return null;
  }

  return userTenants;
}

export async function getDepartments(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Departments')
    .select(
      `
      *,
      parent_department:parent_department_id(*)
    `,
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('name', { ascending: true });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: departments, error, count } = await query;

  if (error) {
    console.error('Error fetching departments:', error);
    return { departments: null, count: 0 };
  }

  return { departments, count };
}

export async function getDepartment(supabase: SupabaseClient, id: string) {
  const { data: department, error } = await supabase
    .from('Departments')
    .select(
      `
      *,
      parent_department:parent_department_id(*)
    `
    )
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching department:', error);
    return null;
  }

  return department;
}

export async function addDepartment(
  supabase: SupabaseClient,
  departmentData: any
) {
  const { data, error } = await supabase
    .from('Departments')
    .insert([
      {
        ...departmentData,
        is_deleted: false
      }
    ])
    .select();

  if (error) {
    console.error('Error adding department:', error);
    throw error;
  }

  return data;
}

export async function updateDepartment(
  supabase: SupabaseClient,
  departmentData: any
) {
  const { id, parent_department, ...updateData } = departmentData;

  const { data, error } = await supabase
    .from('Departments')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating department:', error);
    throw error;
  }

  return data;
}

export async function addEmployeeDepartments(
  supabase: SupabaseClient,
  employeeId: string,
  departmentIds: string[]
) {
  const { error } = await supabase.from('EmployeeDepartments').upsert(
    departmentIds.map((departmentId) => ({
      employee_id: employeeId,
      department_id: departmentId,
      assigned_at: new Date().toISOString()
    }))
  );

  if (error) {
    console.error('Error adding employee departments:', error);
    throw error;
  }
}

export async function removeEmployeeDepartments(
  supabase: SupabaseClient,
  employeeId: string
) {
  const { error } = await supabase
    .from('EmployeeDepartments')
    .delete()
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error removing employee departments:', error);
    throw error;
  }
}

export async function getKnowledges(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Knowledges')
    .select('*', { count: 'exact' })
    .eq('is_deleted', false)
    .eq('tenant_id', tenantId)
    .order('title', { ascending: true });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: knowledges, error, count } = await query;

  if (error) {
    console.error('Error fetching knowledges:', error);
    return { knowledges: null, count: 0 };
  }

  return { knowledges, count };
}

export async function getKnowledge(supabase: SupabaseClient, id: string) {
  const { data: knowledge, error } = await supabase
    .from('Knowledges')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (error) {
    console.error('Error fetching knowledge:', error);
    return null;
  }

  return knowledge;
}

export async function addKnowledge(
  supabase: SupabaseClient,
  knowledgeData: any
) {
  const { data, error } = await supabase
    .from('Knowledges')
    .insert([
      {
        ...knowledgeData,
        is_deleted: false
      }
    ])
    .select();

  if (error) {
    console.error('Error adding knowledge:', error);
    throw error;
  }

  return data;
}

export async function updateKnowledge(
  supabase: SupabaseClient,
  knowledgeData: any
) {
  const { id, ...updateData } = knowledgeData;

  const { data, error } = await supabase
    .from('Knowledges')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating knowledge:', error);
    throw error;
  }

  return data;
}

export async function getEmployeeKnowledge(
  supabase: SupabaseClient,
  employeeId: string
) {
  const { data, error } = await supabase
    .from('EmployeeKnowledges')
    .select(
      `
      *,
      knowledge:Knowledges(*)
    `
    )
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error fetching employee knowledges:', error);
    return null;
  }

  return data;
}

export async function addEmployeeKnowledge(
  supabase: SupabaseClient,
  employeeId: string,
  knowledgeIds: string[]
) {
  const { error } = await supabase.from('EmployeeKnowledges').insert(
    knowledgeIds.map((knowledgeId) => ({
      employee_id: employeeId,
      knowledge_id: knowledgeId,
      acquired_at: new Date().toISOString()
    }))
  );

  if (error) {
    console.error('Error adding employee knowledge:', error);
    throw error;
  }
}

export async function removeEmployeeKnowledge(
  supabase: SupabaseClient,
  employeeId: string
) {
  const { error } = await supabase
    .from('EmployeeKnowledges')
    .delete()
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error removing employee knowledge:', error);
    throw error;
  }
}

export async function getProjectKnowledges(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from('ProjectKnowledges')
    .select(
      `
      *,
      knowledge:Knowledges(*)
    `
    )
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching project knowledges:', error);
    return null;
  }

  return data;
}

export async function addProjectKnowledge(
  supabase: SupabaseClient,
  projectId: string,
  knowledgeIds: string[]
) {
  const { error } = await supabase.from('ProjectKnowledges').insert(
    knowledgeIds.map((knowledgeId) => ({
      project_id: projectId,
      knowledge_id: knowledgeId,
      assigned_at: new Date().toISOString()
    }))
  );

  if (error) {
    console.error('Error adding project knowledge:', error);
    throw error;
  }
}

export async function removeProjectKnowledge(
  supabase: SupabaseClient,
  projectId: string
) {
  const { error } = await supabase
    .from('ProjectKnowledges')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    console.error('Error removing project knowledge:', error);
    throw error;
  }
}

export async function getEmployeeSuggestions(
  supabase: SupabaseClient,
  tenantId: string,
  selectedKnowledges: string[]
) {
  if (!selectedKnowledges.length) return [];

  const { data: employees, error } = await supabase
    .from('Employees')
    .select(
      `
      id,
      given_name,
      surname,
      EmployeeKnowledges!inner (
        knowledge_id
      ),
      Allocations (
        allocation_percentage,
        start_date,
        end_date
      )
    `
    )
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .in('EmployeeKnowledges.knowledge_id', selectedKnowledges);

  if (error) {
    console.error('Error fetching employee suggestions:', error);
    throw error;
  }

  return employees || [];
}

export async function getPositions(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  try {
    let query = supabase
      .from('Positions')
      .select(
        `
        *,
        department:Departments(name)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Transform the data to match the Position interface
    const positions = data.map((position) => ({
      id: position.id,
      title: position.title,
      department_id: position.department_id,
      department_name: position.department?.name,
      level: position.level,
      is_active: position.is_active
    }));

    return { positions, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getPosition(
  supabase: SupabaseClient,
  positionId: string
) {
  try {
    const { data, error } = await supabase
      .from('Positions')
      .select(
        `
        *,
        department:Departments(id, name)
      `
      )
      .eq('id', positionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addPosition(supabase: SupabaseClient, positionData: any) {
  try {
    const { data, error } = await supabase
      .from('Positions')
      .insert([positionData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updatePosition(
  supabase: SupabaseClient,
  positionData: any
) {
  try {
    const { data, error } = await supabase
      .from('Positions')
      .update(positionData)
      .eq('id', positionData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getContractTypes(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  try {
    let query = supabase
      .from('ContractTypes')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { contractTypes: data, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getContractType(
  supabase: SupabaseClient,
  contractTypeId: string
) {
  try {
    const { data, error } = await supabase
      .from('ContractTypes')
      .select('*')
      .eq('id', contractTypeId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addContractType(
  supabase: SupabaseClient,
  contractTypeData: any
) {
  try {
    const { data, error } = await supabase
      .from('ContractTypes')
      .insert([contractTypeData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updateContractType(
  supabase: SupabaseClient,
  contractTypeData: any
) {
  try {
    const { data, error } = await supabase
      .from('ContractTypes')
      .update(contractTypeData)
      .eq('id', contractTypeData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getEmployeeContracts(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number,
  employeeId?: string
) {
  try {
    let query = supabase
      .from('EmployeeContracts')
      .select(
        `
        *,
        employee:Employees(given_name, surname),
        position:Positions(title),
        contract_type:ContractTypes(name)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId);

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    query = query.order('start_date', { ascending: false });

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const contracts = data.map((contract) => ({
      ...contract,
      employee_name: `${contract.employee.given_name} ${contract.employee.surname}`,
      position_title: contract.position.title,
      contract_type_name: contract.contract_type.name
    }));

    return { contracts, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getEmployeeContract(
  supabase: SupabaseClient,
  contractId: string
) {
  try {
    const { data, error } = await supabase
      .from('EmployeeContracts')
      .select(
        `
        *,
        employee:Employees(id, given_name, surname),
        position:Positions(id, title),
        contract_type:ContractTypes(id, name)
      `
      )
      .eq('id', contractId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addEmployeeContract(
  supabase: SupabaseClient,
  contractData: any
) {
  try {
    const { data, error } = await supabase
      .from('EmployeeContracts')
      .insert([contractData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updateEmployeeContract(
  supabase: SupabaseClient,
  contractData: any
) {
  try {
    const { data, error } = await supabase
      .from('EmployeeContracts')
      .update(contractData)
      .eq('id', contractData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getPublicHolidays(
  supabase: SupabaseClient,
  tenantId: string,
  year?: number,
  page?: number,
  itemsPerPage?: number
) {
  try {
    let query = supabase
      .from('PublicHolidays')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('date', { ascending: true });

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { holidays: data, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getPublicHoliday(
  supabase: SupabaseClient,
  holidayId: string
) {
  try {
    const { data, error } = await supabase
      .from('PublicHolidays')
      .select('*')
      .eq('id', holidayId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addPublicHoliday(
  supabase: SupabaseClient,
  holidayData: any
) {
  try {
    const { data, error } = await supabase
      .from('PublicHolidays')
      .insert([holidayData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updatePublicHoliday(
  supabase: SupabaseClient,
  holidayData: any
) {
  try {
    const { data, error } = await supabase
      .from('PublicHolidays')
      .update(holidayData)
      .eq('id', holidayData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function bulkAddPublicHolidays(
  supabase: SupabaseClient,
  holidays: any[]
) {
  try {
    const { data, error } = await supabase
      .from('PublicHolidays')
      .insert(holidays)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getWorkScheduleTypes(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  try {
    let query = supabase
      .from('WorkScheduleTypes')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { scheduleTypes: data, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getWorkScheduleType(
  supabase: SupabaseClient,
  scheduleTypeId: string
) {
  try {
    const { data, error } = await supabase
      .from('WorkScheduleTypes')
      .select('*')
      .eq('id', scheduleTypeId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addWorkScheduleType(
  supabase: SupabaseClient,
  scheduleTypeData: any
) {
  try {
    const { data, error } = await supabase
      .from('WorkScheduleTypes')
      .insert([scheduleTypeData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updateWorkScheduleType(
  supabase: SupabaseClient,
  scheduleTypeData: any
) {
  try {
    const { data, error } = await supabase
      .from('WorkScheduleTypes')
      .update(scheduleTypeData)
      .eq('id', scheduleTypeData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getWorkLogs(
  supabase: SupabaseClient,
  tenantId: string,
  employeeId?: string,
  startDate?: string,
  endDate?: string,
  page?: number,
  itemsPerPage?: number
) {
  try {
    let query = supabase
      .from('WorkLogs')
      .select(
        `
        *,
        employee:Employees(given_name, surname),
        schedule_type:WorkScheduleTypes(name, multiplier),
        approver:Employees(given_name, surname)
      `,
        { count: 'exact' }
      )
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false });

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    if (page && itemsPerPage) {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const workLogs = data.map((log) => ({
      ...log,
      employee_name: `${log.employee.given_name} ${log.employee.surname}`,
      schedule_type_name: log.schedule_type.name,
      schedule_type_multiplier: log.schedule_type.multiplier,
      approver_name: log.approver
        ? `${log.approver.given_name} ${log.approver.surname}`
        : null
    }));

    return { workLogs, count };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function getWorkLog(supabase: SupabaseClient, workLogId: string) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .select(
        `
        *,
        employee:Employees(id, given_name, surname),
        schedule_type:WorkScheduleTypes(id, name, multiplier)
      `
      )
      .eq('id', workLogId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function addWorkLog(supabase: SupabaseClient, workLogData: any) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .insert([workLogData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function updateWorkLog(
  supabase: SupabaseClient,
  workLogData: any
) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .update(workLogData)
      .eq('id', workLogData.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function approveWorkLog(
  supabase: SupabaseClient,
  workLogId: string,
  approverId: string
) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', workLogId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function rejectWorkLog(
  supabase: SupabaseClient,
  workLogId: string,
  approverId: string
) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .update({
        status: 'rejected',
        approved_by: approverId,
        approved_at: new Date().toISOString()
      })
      .eq('id', workLogId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

export async function bulkAddWorkLogs(
  supabase: SupabaseClient,
  workLogs: any[]
) {
  try {
    const { data, error } = await supabase
      .from('WorkLogs')
      .insert(
        workLogs.map((log) => ({
          ...log,
          status: 'pending'
        }))
      )
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Lead Sources
export async function getLeadSources(
  supabase: SupabaseClient,
  tenantId: string
) {
  const { data: sources, error } = await supabase
    .from('LeadSources')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching lead sources:', error);
    return { sources: null };
  }

  return { sources };
}

// Lead Stages
export async function getLeadStages(
  supabase: SupabaseClient,
  tenantId: string
) {
  const { data: stages, error } = await supabase
    .from('LeadStages')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('order_index');

  if (error) {
    console.error('Error fetching lead stages:', error);
    return { stages: null };
  }

  return { stages };
}

interface LeadData {
  id?: string;
  company_name: string;
  industry?: string;
  website?: string;
  contact_name: string;
  contact_title?: string;
  contact_email?: string;
  contact_phone?: string;
  source_id: string;
  current_stage_id: string;
  status: string;
  assigned_to?: string | null;
  notes?: string;
  tenant_id: string;
}

export async function addLead(supabase: SupabaseClient, leadData: LeadData) {
  const cleanedData = {
    ...leadData,
    assigned_to: leadData.assigned_to || null
  };

  const { data, error } = await supabase
    .from('Leads')
    .insert([cleanedData])
    .select();

  if (error) {
    console.error('Error adding lead:', error);
    throw error;
  }

  return data;
}

export async function updateLead(supabase: SupabaseClient, leadData: LeadData) {
  const cleanedData = {
    ...leadData,
    assigned_to: leadData.assigned_to || null
  };

  const { data, error } = await supabase
    .from('Leads')
    .update(cleanedData)
    .eq('id', leadData.id)
    .select();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  return data;
}

// Leads
export async function getLeads(
  supabase: SupabaseClient,
  tenantId: string,
  page?: number,
  itemsPerPage?: number
) {
  let query = supabase
    .from('Leads')
    .select(
      `
      *,
      source:source_id(name),
      current_stage:current_stage_id(name),
      assigned_to:assigned_to(given_name, surname)
    `,
      { count: 'exact' }
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (page !== undefined && itemsPerPage !== undefined) {
    const startRow = (page - 1) * itemsPerPage;
    query = query.range(startRow, startRow + itemsPerPage - 1);
  }

  const { data: leads, error, count } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    return { leads: null, count: 0 };
  }

  return { leads, count };
}

// export async function getLeadById(
//   supabase: SupabaseClient,
//   leadId: string
// ) {
//   const { data, error } = await supabase
//     .from('Leads')
//     .select('*')
//     .eq('id', leadId)
//     .single();

//   if (error) {
//     console.error('Error fetching lead:', error);
//     throw error;
//   }

//   return data;
// }

export async function getLead(supabase: SupabaseClient, id: string) {
  const { data: lead, error } = await supabase
    .from('Leads')
    .select(
      `
      *,
      source:source_id(name),
      current_stage:current_stage_id(name),
      assigned_to:assigned_to(given_name, surname)
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    return null;
  }

  return lead;
}

export async function updateLeadStage(
  supabase: SupabaseClient,
  leadId: string,
  toStageId: string,
  userId: string,
  notes?: string
) {
  try {
    // First get the current stage and tenant_id
    const { data: lead, error: leadError } = await supabase
      .from('Leads')
      .select('current_stage_id, tenant_id')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;
    if (!lead) throw new Error('Lead not found');

    // Call the stored procedure
    const { error: procError } = await supabase.rpc('update_lead_stage', {
      p_lead_id: leadId,
      p_from_stage_id: lead.current_stage_id,
      p_to_stage_id: toStageId,
      p_changed_by: userId,
      p_notes: notes || null,
      p_tenant_id: lead.tenant_id
    });

    if (procError) throw procError;

    return true;
  } catch (error) {
    console.error('Error updating lead stage:', error);
    throw error;
  }
}

export async function getLeadStageHistory(
  supabase: SupabaseClient,
  leadId: string
) {
  const { data: history, error } = await supabase.rpc(
    'get_lead_stage_history',
    {
      p_lead_id: leadId
    }
  );

  if (error) {
    console.error('Error fetching lead stage history:', error);
    return { history: null };
  }

  return { history };
}

export async function getLeadsByStage(
  supabase: SupabaseClient,
  tenantId: string,
  stageId?: string
) {
  let query = supabase
    .from('Leads')
    .select(
      `
      *,
      source:source_id(name),
      current_stage:current_stage_id(name),
      assigned_to:assigned_to(given_name, surname)
    `
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (stageId) {
    query = query.eq('current_stage_id', stageId);
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error('Error fetching leads by stage:', error);
    return { leads: null };
  }

  return { leads };
}

interface RawLeadMetrics {
  stage_name: string;
  stage_count: number;
  avg_time_in_stage: string;
  conversion_rate: number;
}

interface LeadMetrics {
  stage_name: string;
  stage_count: number;
  avg_time_in_stage: string;
  conversion_rate: number;
}

export async function getLeadMetrics(
  supabase: SupabaseClient,
  tenantId: string,
  startDate?: string,
  endDate?: string
): Promise<{ metrics: LeadMetrics[] | null }> {
  const { data: metrics, error } = await supabase.rpc('get_lead_metrics', {
    p_tenant_id: tenantId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  if (error) {
    console.error('Error fetching lead metrics:', error);
    return { metrics: null };
  }

  // Format time intervals for display
  const formattedMetrics = (metrics as RawLeadMetrics[]).map(
    (metric: RawLeadMetrics) => ({
      ...metric,
      avg_time_in_stage: formatTimeInterval(metric.avg_time_in_stage)
    })
  );

  return { metrics: formattedMetrics };
}

// Helper function to format PostgreSQL interval to human-readable string
function formatTimeInterval(interval: string): string {
  if (!interval) return '0 days';

  const matches = interval.match(/(\d+) days (\d+):(\d+):(\d+)/);
  if (!matches) return interval;

  const [, days, hours] = matches;
  if (parseInt(days) > 0) {
    return `${days} days`;
  }
  return `${hours} hours`;
}

export async function getLeadsList(
  supabase: SupabaseClient,
  tenantId: string,
  page: number,
  itemsPerPage: number
) {
  const {
    data: leads,
    count,
    error
  } = await supabase
    .from('Leads')
    .select(
      `
      *,
      source:source_id(name),
      current_stage:current_stage_id(name),
      assigned_to:assigned_to(given_name, surname)
    `,
      { count: 'exact' }
    )
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

  if (error) {
    console.error('Error fetching leads list:', error);
    return { leads: null, count: 0 };
  }

  return { leads, count };
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  subject: string;
  description?: string;
  activity_date: string;
  duration_minutes?: number;
  status?: 'planned' | 'completed' | 'cancelled';
  performed_by: string;
  tenant_id: string;
}

export interface LeadDocument {
  id: string;
  lead_id: string;
  name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  tenant_id: string;
}

export async function getLeadActivities(
  supabase: SupabaseClient,
  leadId: string
) {
  const { data, error } = await supabase
    .from('LeadActivities')
    .select(
      `
      *,
      performed_by:Employees(given_name, surname)
    `
    )
    .eq('lead_id', leadId)
    .order('activity_date', { ascending: false });

  if (error) {
    console.error('Error fetching lead activities:', error);
    throw error;
  }

  return data;
}

export async function addLeadActivity(
  supabase: SupabaseClient,
  activity: Omit<LeadActivity, 'id'>
) {
  const { data, error } = await supabase
    .from('LeadActivities')
    .insert([activity])
    .select();

  if (error) {
    console.error('Error adding lead activity:', error);
    throw error;
  }

  return data[0];
}

export async function getLeadDocuments(
  supabase: SupabaseClient,
  leadId: string
) {
  const { data, error } = await supabase
    .from('LeadDocuments')
    .select(
      `
      *,
      uploaded_by:Employees(given_name, surname)
    `
    )
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lead documents:', error);
    throw error;
  }

  return data;
}

export async function addLeadDocument(
  supabase: SupabaseClient,
  file: File,
  documentData: {
    lead_id: string;
    uploaded_by: string;
    tenant_id: string;
  },
  onProgress?: (progress: number) => void
) {
  try {
    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `leads/${documentData.lead_id}/${fileName}`;

    // Create upload options
    const options = {
      cacheControl: '3600',
      upsert: false
    } as const;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('lead-documents')
      .upload(filePath, file, options);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl }
    } = supabase.storage.from('lead-documents').getPublicUrl(filePath);

    // Create document record
    const { data, error } = await supabase
      .from('LeadDocuments')
      .insert([
        {
          lead_id: documentData.lead_id,
          name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: documentData.uploaded_by,
          tenant_id: documentData.tenant_id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

export async function getActiveEmployees(
  supabase: SupabaseClient,
  tenantId: string
) {
  const { data: employees, error } = await supabase
    .from('Employees')
    .select('id, given_name, surname')
    .eq('tenant_id', tenantId)
    .eq('is_deleted', false)
    .order('surname');

  if (error) {
    console.error('Error fetching employees:', error);
    return null;
  }

  return employees;
}

export async function deleteLeadDocument(
  supabase: SupabaseClient,
  document: {
    id: string;
    file_url: string;
  }
) {
  try {
    // Extract path from URL pattern: /leads/{leadId}/{filename}
    const matches = document.file_url.match(/\/leads\/(.+?)\/([^/]+)$/);
    if (!matches) throw new Error('Invalid file URL format');

    const filePath = `leads/${matches[1]}/${matches[2]}`;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('lead-documents')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete record from database
    const { error: dbError } = await supabase
      .from('LeadDocuments')
      .delete()
      .eq('id', document.id);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export interface LeadFollowUp {
  id: string;
  lead_id: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  description: string;
  assigned_to: string;
  completed_at?: string;
  tenant_id: string;
}

export async function addLeadFollowUp(
  supabase: SupabaseClient,
  followUp: Omit<LeadFollowUp, 'id' | 'status'>
) {
  const { data, error } = await supabase
    .from('LeadFollowUps')
    .insert([
      {
        ...followUp,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeadFollowUps(
  supabase: SupabaseClient,
  leadId: string
) {
  const { data, error } = await supabase
    .from('LeadFollowUps')
    .select(
      `
      *,
      assigned_to:Employees(given_name, surname)
    `
    )
    .eq('lead_id', leadId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function completeFollowUp(
  supabase: SupabaseClient,
  followUpId: string
) {
  const { data, error } = await supabase
    .from('LeadFollowUps')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', followUpId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export interface LeadConversion {
  id: string;
  lead_id: string;
  converted_at: string;
  converted_by: string;
  client_id: string;
  conversion_notes?: string;
  deal_value?: number;
  tenant_id: string;
}

export async function convertLeadToClient(
  supabase: SupabaseClient,
  leadId: string,
  conversionData: {
    converted_by: string;
    conversion_notes?: string;
    deal_value?: number;
    tenant_id: string;
  }
) {
  try {
    // Start a transaction
    const { data: lead, error: leadError } = await supabase
      .from('Leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError) throw leadError;

    // Create client record
    const { data: client, error: clientError } = await supabase
      .from('Clients')
      .insert([
        {
          name: lead.company_name,
          client_code: lead.company_name.substring(0, 8).toUpperCase(),
          // industry: lead.industry,
          // website: lead.website,
          // contact_name: lead.contact_name,
          // contact_title: lead.contact_title,
          // contact_email: lead.contact_email,
          // contact_phone: lead.contact_phone,
          tenant_id: conversionData.tenant_id
        }
      ])
      .select()
      .single();

    if (clientError) throw clientError;

    // Record conversion
    const { error: conversionError } = await supabase
      .from('LeadConversions')
      .insert([
        {
          lead_id: leadId,
          converted_at: new Date().toISOString(),
          converted_by: conversionData.converted_by,
          client_id: client.id,
          conversion_notes: conversionData.conversion_notes,
          deal_value: conversionData.deal_value,
          tenant_id: conversionData.tenant_id
        }
      ]);

    if (conversionError) throw conversionError;

    // Update lead status
    const { error: updateError } = await supabase
      .from('Leads')
      .update({ status: 'converted' })
      .eq('id', leadId);

    if (updateError) throw updateError;

    return client;
  } catch (error) {
    console.error('Error converting lead:', error);
    throw error;
  }
}
