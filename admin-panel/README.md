# CoHub Admin Panel

A modern, responsive admin panel for managing residential communities, built with React, TypeScript, and Supabase.

## 🚀 Features

- **Authentication**: Secure admin login with role-based access
- **Resident Management**: Full CRUD operations for residents
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Real-time Data**: Powered by Supabase for real-time updates
- **Type Safety**: Full TypeScript support
- **Modular Architecture**: Easily extensible for future features

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_ADMIN_EMAIL=admin@cohub.com
   VITE_APP_NAME=CoHub Admin Panel
   ```

4. **Set up the database**
   - Go to your Supabase dashboard
   - Run the SQL commands from `src/lib/database-schema.sql`
   - This will create all necessary tables and policies

5. **Create an admin user**
   - Sign up a user through Supabase Auth
   - Insert their profile into the `admin_users` table:
   ```sql
   INSERT INTO admin_users (id, email, full_name, role) 
   VALUES ('user-uuid-from-auth', 'admin@cohub.com', 'Admin User', 'super_admin');
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗂 Project Structure

```
admin-panel/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Layout.tsx      # Main layout component
│   │   ├── Header.tsx      # Header with user menu
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── ResidentDialog.tsx # Resident CRUD modal
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── hooks/              # Custom React hooks
│   │   └── useResidents.ts # Resident data hooks
│   ├── lib/                # Utility libraries
│   │   ├── supabase.ts     # Supabase client & services
│   │   ├── utils.ts        # General utilities
│   │   └── database-schema.sql # Database schema
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx   # Authentication page
│   │   ├── DashboardPage.tsx # Main dashboard
│   │   ├── ResidentsPage.tsx # Resident management
│   │   └── SettingsPage.tsx # Admin settings
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies & scripts
├── tailwind.config.ts      # Tailwind configuration
├── vite.config.ts          # Vite configuration
└── README.md              # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔐 Authentication

The admin panel uses Supabase Auth with Row Level Security (RLS) policies:

- Only users with entries in the `admin_users` table can access the panel
- Supports two roles: `admin` and `super_admin`
- All database operations are secured with RLS policies

## 📊 Database Schema

### Tables

1. **residents** - Store resident information
2. **admin_users** - Store admin user profiles and roles

### Key Features

- Automatic `updated_at` timestamps
- Row Level Security for data protection
- Indexed columns for performance
- Proper foreign key relationships

## 🎨 UI Components

Built with shadcn/ui components for consistency:

- **Forms**: React Hook Form with Zod validation
- **Tables**: Sortable, searchable data tables
- **Modals**: Accessible dialog components
- **Notifications**: Toast notifications with Sonner
- **Theme**: Light/dark mode support

## 🚀 Future Extensions

The architecture is designed to be modular and extensible:

- **Reports Module**: Add analytics and reporting features
- **Payments Module**: Integrate payment processing
- **Notices Module**: Send notifications to residents
- **Documents Module**: File upload and management
- **Maintenance Module**: Track building maintenance

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch
   - Implement component in appropriate directory
   - Add necessary hooks and services
   - Update types and schemas

2. **Database Changes**
   - Update `database-schema.sql`
   - Create migration scripts
   - Update TypeScript types

3. **Testing**
   - Test all CRUD operations
   - Verify responsive design
   - Check authentication flows

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_ADMIN_EMAIL` | Default admin email | No |
| `VITE_APP_NAME` | Application name | No |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the database schema
- Examine component examples
- Check Supabase dashboard for data issues

---

Built with ❤️ for residential community management.