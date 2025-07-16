# CBPD Admin System

A comprehensive admin dashboard for managing institutions and students in the CBPD (College Board Professional Development) system.

## Features

### Admin Management
- **Role-based Access Control**: Super Admin, Admin, and Moderator roles
- **Secure Authentication**: JWT-based login system
- **Permission Management**: Granular permissions for different operations

### Institution Management
- **Complete CRUD Operations**: Create, Read, Update, Delete institutions
- **Approval Workflow**: Approve/reject institution registrations
- **Bulk Operations**: Approve, terminate, or reactivate multiple institutions
- **Advanced Filtering**: Search by name, email, industry sector, status
- **Status Management**: Approved, Pending, Terminated states

### Student Management
- **Student Overview**: View all students across institutions
- **Status Control**: Activate/deactivate student accounts
- **Institution Linking**: Students linked to their respective institutions
- **Search & Filter**: Find students by name, institution, course, etc.

### Dashboard & Analytics
- **Real-time Statistics**: Institution and student counts
- **Trend Analysis**: Monthly registration trends
- **Top Institutions**: Ranked by student count
- **Recent Activities**: Latest registrations and updates
- **Quick Actions**: Direct access to pending approvals

## Setup Instructions

### 1. Environment Setup
Ensure your `.env` file contains:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Default Admin User
```bash
npm run create-admin
```
This creates a default admin with:
- **Email**: admin@cbpd.com
- **Password**: admin123
- **Role**: Super Admin

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Admin Dashboard
Navigate to: `http://localhost:3000/admin/login`

## Admin Routes

### Authentication
- `/admin/login` - Admin login page
- `/api/admin/login` - Login API endpoint
- `/api/admin/logout` - Logout API endpoint

### Dashboard
- `/admin` - Main admin dashboard
- `/api/admin/dashboard` - Dashboard data API

### Institution Management
- `/admin/institutions` - Institutions management page
- `/admin/institutions/[id]` - Individual institution details
- `/api/admin/institutions` - Institutions CRUD API
- `/api/admin/institutions/[id]` - Individual institution API

### Student Management
- `/admin/students` - Students management page
- `/admin/students/[id]` - Individual student details

### Admin Management
- `/api/admin` - Admin users CRUD API

## API Endpoints

### Admin Authentication
```
POST /api/admin/login
Body: { email, password }
Response: { admin, message }
```

### Dashboard Statistics
```
GET /api/admin/dashboard
Response: { statistics, trends, topInstitutions, recentActivities }
```

### Institution Management
```
GET /api/admin/institutions?page=1&limit=10&search=&status=
Response: { institutions, pagination }

PUT /api/admin/institutions
Body: { institutionIds: [], action: "approve|terminate|reactivate" }
Response: { message, modifiedCount }

GET /api/admin/institutions/[id]
Response: { institution, statistics, recentStudents }

PUT /api/admin/institutions/[id]
Body: { action: "approve|terminate|reactivate" }
Response: { message, institution }
```

### Admin User Management
```
GET /api/admin?page=1&limit=10&search=&role=
Response: { admins, pagination }

POST /api/admin
Body: { username, email, password, fullName, role }
Response: { message, admin }
```

## Role Permissions

### Super Admin
- Full access to all features
- Can create/manage other admins
- Can delete institutions and students
- All CRUD operations

### Admin
- Can approve/reject institutions
- Can manage students
- Cannot manage other admins
- Cannot delete institutions

### Moderator
- Read-only access
- Can view institutions and students
- Cannot approve or modify data

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: Granular permission system
- **HTTP-only Cookies**: Secure token storage
- **Input Validation**: Server-side validation for all inputs

## Database Models

### Admin Model
```typescript
{
  username: String (unique)
  email: String (unique)
  password: String (hashed)
  fullName: String
  role: "super_admin" | "admin" | "moderator"
  permissions: {
    institutions: { create, read, update, delete, approve }
    students: { create, read, update, delete }
    admins: { create, read, update, delete }
  }
  isActive: Boolean
  lastLogin: Date
}
```

## Usage Examples

### Creating a New Admin
```javascript
// Only super_admin can create new admins
const response = await fetch('/api/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'newadmin',
    email: 'newadmin@cbpd.com',
    password: 'securepassword',
    fullName: 'New Admin User',
    role: 'admin'
  })
});
```

### Bulk Institution Approval
```javascript
const response = await fetch('/api/admin/institutions', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    institutionIds: ['id1', 'id2', 'id3'],
    action: 'approve'
  })
});
```

## Troubleshooting

### Common Issues

1. **Admin Login Failed**
   - Ensure default admin is created: `npm run create-admin`
   - Check MongoDB connection
   - Verify JWT_SECRET in environment

2. **Permission Denied**
   - Check user role and permissions
   - Ensure proper authentication token

3. **Database Connection Issues**
   - Verify MONGODB_URI in .env file
   - Ensure MongoDB server is running

### Development Tips

1. **Testing Different Roles**
   - Create admins with different roles to test permissions
   - Use browser dev tools to inspect JWT tokens

2. **Database Inspection**
   - Use MongoDB Compass or similar tools to inspect data
   - Check admin permissions in database

3. **API Testing**
   - Use Postman or similar tools to test API endpoints
   - Include authentication cookies in requests

## Production Deployment

1. **Environment Variables**
   - Set secure JWT_SECRET
   - Use production MongoDB URI
   - Enable HTTPS for secure cookies

2. **Security Considerations**
   - Change default admin credentials
   - Implement rate limiting
   - Add CORS configuration
   - Enable security headers

3. **Performance Optimization**
   - Add database indexes
   - Implement caching
   - Optimize queries with pagination

## Support

For issues or questions regarding the admin system:
1. Check the troubleshooting section
2. Review API documentation
3. Inspect browser console for errors
4. Check server logs for detailed error messages