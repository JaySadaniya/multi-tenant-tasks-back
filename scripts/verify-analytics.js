const API_URL = 'http://localhost:3000/api/v1';

async function request(method, url, data = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const responseData = await response.json();

  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status} ${response.statusText}`);
    error.response = { data: responseData };
    throw error;
  }

  return { data: responseData };
}

async function runVerification() {
  try {
    console.log('Starting verification...');

    // 1. Create Organization
    console.log('Creating Organization...');
    const orgRes = await request('POST', `${API_URL}/organizations`, {
      name: 'Analytics Test Org ' + Date.now(),
    });
    const organizationId = orgRes.data.id;
    console.log('Organization created:', organizationId);

    // 2. Create Project
    console.log('Creating Project...');
    const projectRes = await request('POST', `${API_URL}/projects`, {
      organizationId,
      name: 'Analytics Test Project',
    });
    const projectId = projectRes.data.id;
    console.log('Project created:', projectId);

    // 3. Create User
    console.log('Creating User...');
    const userEmail = `user${Date.now()}@test.com`;
    const userRes = await request('POST', `${API_URL}/users/register`, {
      email: userEmail,
      password: 'password123',
      organizationId,
    });
    const userId = userRes.data.user.id;
    const token = userRes.data.token;
    console.log('User created:', userId);

    // 4. Add User to Project
    console.log('Adding User to Project...');
    await request('POST', `${API_URL}/projects/${projectId}/users`, {
      userId,
    }, token);
    console.log('User added to project');

    // 5. Create Tasks
    // Task 1: DONE (completed immediately)
    console.log('Creating Task 1 (DONE)...');
    const task1Res = await request('POST', `${API_URL}/tasks`, {
      title: 'Task 1',
      projectId,
      assigneeId: userId,
      status: 'To Do',
      dueDate: new Date().toISOString(),
    }, token);
    const task1Id = task1Res.data.id;
    await request('PATCH', `${API_URL}/tasks/${task1Id}/status`, {
      status: 'Done',
    }, token);

    // Task 2: Overdue (Due date in past, not done)
    console.log('Creating Task 2 (Overdue)...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const task2Res = await request('POST', `${API_URL}/tasks`, {
      title: 'Task 2',
      projectId,
      assigneeId: userId,
      status: 'To Do',
      dueDate: pastDate.toISOString(),
    }, token);

    // Task 3: In Progress (Not overdue, due future)
    console.log('Creating Task 3 (In Progress)...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    await request('POST', `${API_URL}/tasks`, {
      title: 'Task 3',
      projectId,
      assigneeId: userId,
      status: 'In Progress',
      dueDate: futureDate.toISOString(),
    }, token);

    // 6. Get Analytics
    console.log('Fetching Analytics...');
    const analyticsRes = await request('GET', `${API_URL}/projects/${projectId}/analytics`, null, token);
    const analytics = analyticsRes.data;

    console.log('Analytics Result:', JSON.stringify(analytics, null, 2));

    // Assertions
    let passed = true;

    // Check Completed Tasks Per User
    const userStat = analytics.completedTasksPerUser.find((s) => s.userId === userId);
    if (userStat && userStat.count == 1) {
       console.log('✅ Completed Tasks Per User: OK');
    } else {
       console.error('❌ Completed Tasks Per User: FAILED');
       passed = false;
    }

    // Check Overdue Task Count
    if (analytics.overdueTaskCount == 1) {
       console.log('✅ Overdue Task Count: OK');
    } else {
       console.error('❌ Overdue Task Count: FAILED');
       passed = false;
    }

    // Check Average Completion Time
    // Since task 1 was completed almost immediately, avg time should be small but existing.
    if (typeof analytics.averageCompletionTime === 'number' && analytics.averageCompletionTime >= 0) {
       console.log('✅ Average Completion Time: OK (' + analytics.averageCompletionTime + 'ms)');
    } else {
       console.error('❌ Average Completion Time: FAILED');
       passed = false;
    }

    if (passed) {
        console.log('🎉 VERIFICATION PASSED!');
    } else {
        console.error('💥 VERIFICATION FAILED!');
        process.exit(1);
    }

  } catch (error) {
    console.error('Verification failed:', error.message);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

runVerification();
