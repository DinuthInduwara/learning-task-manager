A comprehensive full-stack study planner web application designed specifically for A/L (Advanced Level) exam preparation. This app helps students organize their study tasks across multiple subjects with progress tracking and task management features.

## 🚀 Features

### Core Features

-   **Dashboard View**: Calendar/timetable view with today's tasks and progress overview
-   **Subject Management**: Support for Physics, Pure Maths, Applied Maths, and ICT (customizable)
-   **Task Categories**:
    -   📚 Theory Lessons
    -   🎥 Video Resources
    -   📝 Paper Practice
-   **Progress Tracking**: Visual progress bars and completion statistics per subject
-   **Task Management**: Add, complete, delete, and filter tasks
-   **Responsive Design**: Mobile-friendly interface
-   **Dark/Light Mode**: Theme toggle support

### Advanced Features

-   **Smart Filtering**: Filter by subject, task type, status, and search
-   **Due Date Management**: Track overdue and today's tasks
-   **Video Integration**: Link video resources to tasks
-   **Notes System**: Add detailed notes to tasks
-   **Real-time Updates**: Instant UI updates with optimistic rendering

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, React, TypeScript
-   **Styling**: TailwindCSS, shadcn/ui components
-   **Backend**: Supabase (PostgreSQL database)
-   **State Management**: React hooks and context
-   **Date Handling**: date-fns
-   **Icons**: Lucide React

## 📦 Installation & Setup

### Prerequisites

-   Node.js 18+
-   npm or yarn
-   Supabase account

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd study-planner
npm install
\`\`\`

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 3. Database Setup

The app includes SQL scripts to set up your database. In your Supabase dashboard:

1. Go to SQL Editor
2. Run the script from `scripts/01-create-tables.sql`

This will create:

-   `subjects` table with default A/L subjects
-   `tasks` table for managing study tasks
-   Proper indexes for performance

### 4. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see your study planner!

## 📱 Usage Guide

### Getting Started

1. **Add Your First Task**: Click "Add Task" to create a study task
2. **Choose Task Type**: Select Theory, Video, or Paper practice
3. **Set Subject**: Assign to Physics, Maths, Applied Maths, or ICT
4. **Add Details**: Include notes, video URLs, and due dates

### Managing Tasks

-   **Complete Tasks**: Click the circle icon to mark tasks as done ✅
-   **Filter Tasks**: Use the filter options to find specific tasks
-   **Track Progress**: View subject-wise progress in the "Subject Progress" tab
-   **Today's Focus**: Check "Today's Tasks" for items due today

### Dashboard Features

-   **Stats Overview**: See total tasks, completion percentage, and overdue items
-   **Subject Progress**: Visual progress bars for each subject
-   **Search & Filter**: Find tasks quickly with advanced filtering
-   **Responsive Design**: Works perfectly on mobile and desktop

## 🏗️ Project Structure

\`\`\`
study-planner/
├── app/ # Next.js app directory
│ ├── layout.tsx # Root layout with theme provider
│ ├── page.tsx # Main dashboard page
│ └── globals.css # Global styles
├── components/ # React components
│ ├── ui/ # shadcn/ui components
│ ├── navbar.tsx # Navigation bar
│ ├── task-card.tsx # Individual task display
│ ├── add-task-dialog.tsx # Task creation modal
│ ├── subject-progress.tsx # Progress visualization
│ └── task-filters.tsx # Filtering interface
├── lib/ # Utility libraries
│ ├── supabase.ts # Supabase client setup
│ ├── database.ts # Database operations
│ └── utils.ts # Helper functions
├── scripts/ # Database setup scripts
│ └── 01-create-tables.sql
└── hooks/ # Custom React hooks
└── use-toast.ts # Toast notifications
\`\`\`

## 🔧 Customization

### Adding New Subjects

1. Go to your Supabase dashboard
2. Navigate to Table Editor > subjects
3. Insert new rows with subject name and color

### Modifying Task Types

Edit the task type options in:

-   `components/add-task-dialog.tsx`
-   `components/task-card.tsx`
-   Database schema in `scripts/01-create-tables.sql`

### Styling Changes

-   Colors: Modify `tailwind.config.ts`
-   Components: Edit files in `components/ui/`
-   Global styles: Update `app/globals.css`

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your Supabase connection and environment variables
3. Ensure database tables are created correctly
4. Open an issue on GitHub with detailed error information

## 🎯 Future Enhancements

-   [ ] Calendar integration
-   [ ] Study time tracking
-   [ ] Progress analytics and charts
-   [ ] Export/import functionality
-   [ ] Mobile app version
-   [ ] Collaborative study groups
-   [ ] AI-powered study recommendations

---

**Happy Studying! 📚✨**

Built with ❤️ for A/L students
