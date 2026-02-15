
import { sequelize, Organization, User, Project, Task, ActivityLog } from '../models';
import { UserRole, TaskStatus } from '../types';

async function testModels() {
  try {
    console.log('Authenticating...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync database (force: true to recreate tables)
    // console.log('Syncing database...');
    // await sequelize.sync({ force: true });
    // console.log('Database synced.');
    
    // Ensure migrations are run before running this script!

    // 1. Create Organization
    console.log('Creating Organization...');
    const org = await Organization.create({
      name: 'Acme Corp',
    });
    console.log('Organization created:', org.toJSON());

    // 2. Create User (Admin)
    console.log('Creating Admin User...');
    const admin = await User.create({
      email: 'admin@acme.com',
      password: 'securepassword', // In real app, hash this!
      role: UserRole.ADMIN,
      organizationId: org.id,
    });
    console.log('Admin created:', admin.toJSON());

    // 3. Create Project
    console.log('Creating Project...');
    const project = await Project.create({
      name: 'Project Alpha',
      organizationId: org.id,
    });
    console.log('Project created:', project.toJSON());

    // 4. Create Task
    console.log('Creating Task...');
    const task = await Task.create({
      title: 'Initial Setup',
      description: 'Setup the environment',
      status: TaskStatus.TODO,
      projectId: project.id,
      assigneeId: admin.id,
    });
    console.log('Task created:', task.toJSON());

    // 5. Create ActivityLog
    console.log('Creating ActivityLog...');
    const log = await ActivityLog.create({
      action: 'CREATE_TASK',
      entityType: 'Task',
      entityId: task.id,
      userId: admin.id,
      organizationId: org.id,
    });
    console.log('ActivityLog created:', log.toJSON());

    // 6. Verify Associations
    console.log('Verifying Associations...');
    
    // Fetch Organization with Users and Projects
    const orgWithData = await Organization.findOne({
      where: { id: org.id },
      include: ['users', 'projects'],
    });
    console.log('Org with Users and Projects:', JSON.stringify(orgWithData?.toJSON(), null, 2));

    // Fetch Project with Tasks
    const projectWithTasks = await Project.findOne({
      where: { id: project.id },
      include: ['tasks'],
    });
    console.log('Project with Tasks:', JSON.stringify(projectWithTasks?.toJSON(), null, 2));

    // Fetch User with Assigned Tasks
    const userWithTasks = await User.findOne({
      where: { id: admin.id },
      include: ['assignedTasks'],
    });
    console.log('User with Assigned Tasks:', JSON.stringify(userWithTasks?.toJSON(), null, 2));

    // Soft Delete Test
    console.log('Testing Soft Delete on Task...');
    await task.destroy();
    const deletedTask = await Task.findByPk(task.id);
    console.log('Deleted Task (should be null):', deletedTask);
    
    const paranoidTask = await Task.findByPk(task.id, { paranoid: false });
    console.log('Deleted Task (paranoid: false):', paranoidTask ? 'Found' : 'Not Found');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testModels();
