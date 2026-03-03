const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const Authority = require('../models/Authority');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create roles
    const superAdminRole = await Role.findOneAndUpdate(
      { name: 'SUPER_ADMIN' },
      {
        name: 'SUPER_ADMIN',
        description: 'Full system control and authority management',
        permissions: [
          'ADD_AUTHORITIES',
          'REMOVE_AUTHORITIES',
          'ADD_MEMBERS',
          'REMOVE_MEMBERS',
          'ADD_VEHICLES',
          'REMOVE_VEHICLES',
          'VIEW_ALL_DATA',
          'MANAGE_ALL_RESOURCES',
          'REMOTE_VEHICLE_CONTROL',
          'CHALLAN_MANAGEMENT',
          'GENERATE_REPORTS'
        ]
      },
      { upsert: true, new: true }
    );

    const ownerRole = await Role.findOneAndUpdate(
      { name: 'OWNER' },
      {
        name: 'OWNER',
        description: 'Manage owned resources and subordinate drivers',
        permissions: [
          'VIEW_OWNED_DATA',
          'ADD_VEHICLES',
          'ADD_MEMBERS',
          'MONITOR_DRIVERS',
          'VIEW_VIOLATIONS',
          'VIEW_CHALLANS'
        ]
      },
      { upsert: true, new: true }
    );

    const driverRole = await Role.findOneAndUpdate(
      { name: 'DRIVER' },
      {
        name: 'DRIVER',
        description: 'Limited self-service access for personal operations',
        permissions: [
          'VIEW_OWN_DETAILS',
          'VIEW_ASSIGNED_VEHICLE',
          'VIEW_TRIP_DETAILS',
          'VIEW_VIOLATIONS',
          'SUBMIT_REPORTS'
        ]
      },
      { upsert: true, new: true }
    );

    console.log('Roles created/updated');

    // Create default authority if not exists
    let authority = await Authority.findOne({ code: 'SMTMS_DEFAULT' });
    if (!authority) {
      authority = await Authority.create({
        name: 'SMTMS Central Authority',
        code: 'SMTMS_DEFAULT',
        description: 'Default central authority for SMTMS',
        status: 'ACTIVE',
        location: {
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [77.2090, 28.6139]
          }
        }
      });
      console.log('Default authority created');
    }

    // Create default super admin if not exists
    let superAdmin = await User.findOne({ email: 'admin@smtms.gov.in' });
    if (!superAdmin) {
      superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@smtms.gov.in',
        phone: '+91-1234567890',
        password: 'admin123',
        role: superAdminRole._id,
        authority: authority._id,
        status: 'ACTIVE'
      });
      console.log('Default super admin created');
    }

    // Update authority with super admin
    authority.superAdmin = superAdmin._id;
    await authority.save();

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
