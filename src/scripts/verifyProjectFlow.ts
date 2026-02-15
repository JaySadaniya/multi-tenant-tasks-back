import { sequelize, Organization, User, Project, Task, ProjectUser } from '../models';
import { UserRole, TaskStatus } from '../types';

async function verifyProjectFlow() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Create Organization
    const orgName = `TestOrg_${Date.now()}`;
    const organization = await Organization.create({ name: orgName });
    console.log(`Organization created: ${organization.name}`);

    // 2. Create Users
    const user1 = await User.create({
      email: `user1_${Date.now()}@test.com`,
      password: 'password123',
      organizationId: organization.id,
      role: UserRole.MEMBER
    });
    const user2 = await User.create({
      email: `user2_${Date.now()}@test.com`,
      password: 'password123',
      organizationId: organization.id,
      role: UserRole.MEMBER
    });
    console.log(`Users created: ${user1.email}, ${user2.email}`);

    // 3. Create Project
    const project = await Project.create({
      name: 'Project Alpha',
      organizationId: organization.id
    });
    console.log(`Project created: ${project.name}`);

    // 4. Add User 1 to Project
    // @ts-ignore
    await project.addMember(user1);
    console.log(`User 1 added to Project.`);

    // 5. Create Task assigned to User 1 (Should Succeed)
    try {
      const task1 = await Task.create({
        title: 'Task for User 1',
        projectId: project.id,
        assigneeId: user1.id, // User 1 is member
        status: TaskStatus.TODO // NEEDED
      });
      console.log('Task 1 created successfully via Model directly.');
    } catch (error) {
       console.error('Task 1 creation failed:', error);
    }

    // Retrying with Service Logic Simulation
    console.log('--- Testing Service Logic ---');
    
    // Import logic or just re-implement check for verification if I can't import service easily (I can).
    const { createTask } = require('../services/taskService');

    try {
      await createTask({
        title: 'Task for User 1 via Service',
        projectId: project.id,
        assigneeId: user1.id,
        status: TaskStatus.TODO
      });
      console.log('✅ Success: Task assigned to member User 1.');
    } catch (err: any) {
      console.error('❌ Failed: Task assigned to member User 1 should succeed.', err.message);
    }

    // 6. Create Task assigned to User 2 (Should Fail)
    try {
      await createTask({
        title: 'Task for User 2 via Service',
        projectId: project.id,
        assigneeId: user2.id,
        status: TaskStatus.TODO
      });
      console.error('❌ Failed: Task assigned to non-member User 2 should have failed but succeeded.');
    } catch (err: any) {
      if (err.message === 'Assignee must be a member of the project') {
        console.log('✅ Success: Task assigned to non-member User 2 failed as expected.');
      } else {
        console.error('❌ Failed with unexpected error:', err.message);
      }
    }

    // 7. Add User 2 to Project
    // @ts-ignore
    await project.addMember(user2);
    console.log('User 2 added to Project.');

    // 8. Retry Task for User 2 (Should Succeed)
    let taskForUser2;
    try {
      taskForUser2 = await createTask({
        title: 'Task for User 2 via Service (Retry)',
        projectId: project.id,
        assigneeId: user2.id,
        status: TaskStatus.TODO
      });
      console.log('✅ Success: Task assigned to User 2 after adding to project.');
    } catch (err: any) {
      console.error('❌ Failed: Task assigned to User 2 after adding should succeed.', err.message);
    }

    // 9. Update Task: Remove Assignee (Should Succeed)
    if (taskForUser2) {
      const { updateTask } = require('../services/taskService');
      try {
        await updateTask(taskForUser2.id, { assigneeId: null });
        console.log('✅ Success: Task assignee removed.');
      } catch (err: any) {
        console.error('❌ Failed: Removing assignee should succeed.', err.message);
      }

      // 10. Update Task: Re-assign to User 1 (Should Succeed)
      try {
        await updateTask(taskForUser2.id, { assigneeId: user1.id, status: TaskStatus.IN_PROGRESS });
        console.log('✅ Success: Task re-assigned to member User 1.');
      } catch (err: any) {
        console.error('❌ Failed: Re-assigning to member should succeed.', err.message);
      }

      // 11. Remove User 1 from Project (Simulate non-member for test)
      // Manually remove for test
      await ProjectUser.destroy({ where: { projectId: project.id, userId: user1.id } });
      console.log('User 1 removed from Project (for testing).');

      // 11.5 Unassign first to ensure 'change' is detected (since currently assigned to User 1)
      await updateTask(taskForUser2.id, { assigneeId: null });

      // 12. Update Task: Re-assign to User 1 (Should Fail now)
      try {
        await updateTask(taskForUser2.id, { assigneeId: user1.id });
        console.error('❌ Failed: Re-assigning to non-member User 1 should fail but succeeded.');
      } catch (err: any) {
        if (err.message === 'Assignee must be a member of the project') {
          console.log('✅ Success: Re-assigning to non-member User 1 failed as expected.');
        } else {
          console.error('❌ Failed with unexpected error:', err.message);
        }
      }

      // 13. Delete Task
      const { deleteTask } = require('../services/taskService');
      try {
        await deleteTask(taskForUser2.id);
        console.log('✅ Success: Task deleted.');
      } catch (err: any) {
        console.error('❌ Failed: Task deletion failed.', err.message);
      }
      
      // 14. Verify Deletion
      const deletedTask = await Task.findByPk(taskForUser2.id);
      if (!deletedTask) {
         console.log('✅ Success: Task not found after deletion.');
      } else {
         console.error('❌ Failed: Task still exists after deletion.');
      }
    }

    // 15. Verify Pagination and Filtering
    console.log('--- Testing Pagination and Filtering ---');
    // Create 5 tasks for pagination
    for (let i = 1; i <= 5; i++) {
      await Task.create({
        title: `Pagination Task ${i}`,
        projectId: project.id,
        assigneeId: user1.id, // Assign all to User 1
        status: TaskStatus.TODO
      });
    }

    const { getTasks } = require('../services/taskService');
    
    // Test 1: Pagination (Page 1, Limit 2) -> Expect 2 tasks
    const page1 = await getTasks({ projectId: project.id }, { page: 1, limit: 2 });
    if (page1.tasks.length === 2 && page1.total >= 5) {
      console.log(`✅ Success: Page 1 returned ${page1.tasks.length} tasks (Total: ${page1.total}).`);
    } else {
      console.error(`❌ Failed: Page 1 expected 2 tasks, got ${page1.tasks.length}.`);
    }

    // Test 2: Pagination (Page 2, Limit 2) -> Expect 2 tasks
    const page2 = await getTasks({ projectId: project.id }, { page: 2, limit: 2 });
    // Verify they are different tasks
    if (page2.tasks.length === 2 && page2.tasks[0].id !== page1.tasks[0].id) {
       console.log(`✅ Success: Page 2 returned ${page2.tasks.length} different tasks.`);
    } else {
       console.error(`❌ Failed: Page 2 verification failed.`);
    }

    // Test 3: Filtering by Assignee (User 1)
    const user1Tasks = await getTasks({ projectId: project.id, assigneeId: user1.id }, { page: 1, limit: 10 });
    // We created 5 pagination tasks + 1 previous task (re-assigned to User 1) = 6 tasks? (Previous logic might have deleted/reassigned)
    // Just check if we get results and all belong to User 1
    if (user1Tasks.tasks.length > 0 && user1Tasks.tasks.every((t: any) => t.assigneeId === user1.id)) {
      console.log(`✅ Success: Filtered by Assignee User 1 returned ${user1Tasks.tasks.length} tasks.`);
    } else {
      console.error(`❌ Failed: Filtering by Assignee User 1 failed.`);
    }

    // Test 4: Search
    const searchResult = await getTasks({ projectId: project.id, search: 'Pagination Task' }, { page: 1, limit: 10 });
    if (searchResult.tasks.length === 5) {
       console.log(`✅ Success: Search 'Pagination Task' returned 5 tasks.`);
    } else {
       console.error(`❌ Failed: Search expected 5 tasks, got ${searchResult.tasks.length}.`);
    }

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await sequelize.close();
  }
}

verifyProjectFlow();
