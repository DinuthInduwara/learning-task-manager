# Study Planner API Documentation

## Overview
The Study Planner API provides endpoints for managing lessons and tasks in the study planner application.

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Endpoints

### POST /api/lessons
Create a new lesson/task in the study planner.

#### Request Body
\`\`\`json
{
  "title": "Lesson 01 - Kinematics",
  "type": "Video",
  "subject": "Physics", 
  "lesson": "Kinematics",
  "dueDate": "2025-09-30",
  "notes": "Watch until projectile motion examples"
}
\`\`\`

#### Parameters
- `title` (string, required): The title of the task
- `type` (string, required): Task type - must be "Theory", "Video", or "Paper"
- `subject` (string, required): Subject name - must match existing subject in database
- `lesson` (string, required): Lesson name for categorization
- `dueDate` (string, optional): Due date in YYYY-MM-DD format
- `notes` (string, optional): Additional notes for the task

#### Response
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Lesson 01 - Kinematics",
    "type": "video",
    "subject_id": "uuid",
    "lesson": "Kinematics",
    "status": "todo",
    "due_date": "2025-09-30",
    "notes": "Watch until projectile motion examples",
    "created_at": "2025-01-08T...",
    "subjects": {
      "id": "uuid",
      "name": "Physics",
      "color": "#EF4444"
    }
  },
  "message": "Lesson created successfully"
}
\`\`\`

#### Error Responses
- `400 Bad Request`: Missing required fields or invalid type
- `404 Not Found`: Subject not found
- `500 Internal Server Error`: Database or server error

### GET /api/lessons
Retrieve lessons with optional filtering.

#### Query Parameters
- `subject` (string, optional): Filter by subject name
- `lesson` (string, optional): Filter by lesson name
- `type` (string, optional): Filter by task type (theory, video, paper)
- `status` (string, optional): Filter by completion status (todo, done)

#### Example Requests
\`\`\`bash
# Get all lessons
GET /api/lessons

# Get Physics lessons only
GET /api/lessons?subject=Physics

# Get Kinematics lessons that are videos
GET /api/lessons?lesson=Kinematics&type=video

# Get completed theory lessons
GET /api/lessons?type=theory&status=done

# Combine multiple filters
GET /api/lessons?subject=Physics&lesson=Kinematics&type=Paper
\`\`\`

#### Response
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Lesson 01 - Kinematics",
      "type": "video",
      "subject_id": "uuid",
      "lesson": "Kinematics",
      "status": "todo",
      "due_date": "2025-09-30",
      "notes": "Watch until projectile motion examples",
      "created_at": "2025-01-08T...",
      "subjects": {
        "id": "uuid",
        "name": "Physics",
        "color": "#EF4444"
      }
    }
  ],
  "count": 1
}
\`\`\`

## Usage Examples

### cURL Examples

#### Create a new lesson
\`\`\`bash
curl -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lesson 01 - Kinematics",
    "type": "Video",
    "subject": "Physics",
    "lesson": "Kinematics",
    "dueDate": "2025-09-30",
    "notes": "Watch until projectile motion examples"
  }'
\`\`\`

#### Get filtered lessons
\`\`\`bash
# Get all Physics lessons
curl "http://localhost:3000/api/lessons?subject=Physics"

# Get Kinematics video lessons
curl "http://localhost:3000/api/lessons?lesson=Kinematics&type=video"
\`\`\`

### JavaScript/Fetch Examples

#### Create a lesson
\`\`\`javascript
const response = await fetch('/api/lessons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Lesson 01 - Kinematics',
    type: 'Video',
    subject: 'Physics',
    lesson: 'Kinematics',
    dueDate: '2025-09-30',
    notes: 'Watch until projectile motion examples'
  })
});

const result = await response.json();
console.log(result);
\`\`\`

#### Get filtered lessons
\`\`\`javascript
// Get lessons with multiple filters
const params = new URLSearchParams({
  subject: 'Physics',
  lesson: 'Kinematics',
  type: 'Paper'
});

const response = await fetch(`/api/lessons?${params}`);
const result = await response.json();
console.log(result.data); // Array of matching lessons
\`\`\`

## Available Subjects
The following subjects are available by default:
- Physics
- Pure Maths  
- Applied Maths
- ICT

## Task Types
- **Theory**: Theoretical lessons and study materials
- **Video**: Video resources and lectures
- **Paper**: Practice papers and exercises

## Filtering Capabilities
The API supports filtering by:
- **Subject**: Filter tasks by subject name
- **Lesson**: Filter tasks by lesson name  
- **Type**: Filter by task type (Theory/Video/Paper)
- **Status**: Filter by completion status (todo/done)

Multiple filters can be combined for precise querying.
