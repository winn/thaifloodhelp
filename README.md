# 🌊 Flood Victim Management System

A full-stack web platform for collecting and managing flood disaster victim information from social media posts. Designed for Thai disaster relief workers with a simple, accessible interface. Explanation of the project and Lovable tutorial https://www.youtube.com/watch?v=121fjf-JWvc

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

This system streamlines the process of collecting and organizing flood victim information shared across social media platforms. Relief workers can paste raw text from social media posts, and the AI extracts structured data, detects duplicates, and organizes information for efficient rescue coordination.

### Key Features

- 🤖 **AI-Powered Data Extraction**: Automatically extracts victim details from unstructured Thai text using Google Gemini
- 🔍 **Smart Duplicate Detection**: Vector-based semantic similarity detection prevents duplicate entries
- 📊 **Comprehensive Dashboard**: View, search, and filter victim records with urgency-based prioritization
- 💬 **Natural Language Queries**: Ask questions in Thai to find specific victims or analyze data
- 📱 **Mobile-First Design**: Responsive interface optimized for field work
- 🗺️ **Location Tracking**: GPS coordinate support for mapping victim locations
- 🏷️ **Help Categorization**: Track specific needs (water, food, medical, evacuation, etc.)
- ⚡ **Urgency Classification**: 5-tier urgency system based on demographics and conditions

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini 2.0 Flash (data extraction & embeddings)
- **Vector Search**: PostgreSQL pgvector extension
- **Hosting**: Lovable Cloud

### Data Flow

```
Social Media Post → Input Page → AI Extraction → Review Page → 
Vector Duplicate Check → Database → Dashboard → Query Bot
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key ([Get one for free](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/flood-victim-management.git
cd flood-victim-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id

# Google Gemini API Key (required for AI extraction)
GEMINI_API_KEY=your_gemini_api_key
```

4. **Set up Supabase**

Run the migrations in the `supabase/migrations/` directory to create the database schema:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

5. **Configure Supabase Secrets**

Add the `GEMINI_API_KEY` to your Supabase project secrets:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

6. **Deploy Edge Functions**

```bash
supabase functions deploy extract-report
supabase functions deploy generate-embedding
supabase functions deploy check-duplicates
supabase functions deploy query-reports
supabase functions deploy search-reports
```

7. **Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 📖 Usage Guide

### 1. Input Page (/)

Paste raw text from social media posts containing flood victim information. The system supports:
- Single victim reports
- Multiple victims in one post
- Thai language text
- Unstructured formats

### 2. Report Selection (/select-reports)

If multiple victims are detected, review and select which reports to process.

### 3. Review Page (/review)

- View extracted data side-by-side with original text
- Edit any fields before saving
- All fields are optional
- Urgency level automatically classified (1-5)
- Help categories automatically detected

### 4. Dashboard (/dashboard)

- View all victim records in sortable table
- Filter by urgency level, help categories, demographics
- Search using text or natural language queries
- Click rows to expand and view full details
- Export data for offline analysis

### 5. Query Bot

Ask questions in Thai to search the database:
- "ขอรายชื่อเคสระดับ 5 ทั้งหมดในเชียงใหม่" (List all level 5 cases in Chiang Mai)
- "มีเด็กต่ำกว่า 1 ขวบกี่เคส" (How many cases have infants under 1 year?)
- Natural language search powered by vector embeddings

## 🗄️ Database Schema

### Main Table: `reports`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Victim's first name |
| `lastname` | TEXT | Victim's last name |
| `reporter_name` | TEXT | Person who reported (from social media profile) |
| `raw_message` | TEXT | Original unprocessed text |
| `address` | TEXT | Full address |
| `location_lat` | NUMERIC | GPS latitude |
| `location_long` | NUMERIC | GPS longitude |
| `phone` | TEXT[] | Array of phone numbers |
| `number_of_adults` | INTEGER | Number of adults (18+) |
| `number_of_children` | INTEGER | Number of children (3-17) |
| `number_of_seniors` | INTEGER | Number of seniors (60+) |
| `number_of_infants` | INTEGER | Number of infants (0-2) |
| `number_of_patients` | INTEGER | Number of sick/injured people |
| `health_condition` | TEXT | Medical conditions |
| `help_needed` | TEXT | Description of help needed |
| `help_categories` | TEXT[] | Categories: water, food, medical, etc. |
| `urgency_level` | INTEGER | 1 (low) to 5 (critical) |
| `additional_info` | TEXT | Other important details |
| `embedding` | VECTOR(768) | Vector embedding for similarity search |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last modification time |
| `last_contact_at` | TIMESTAMP | Last contact with victim |
| `status` | TEXT | Current status |

### Urgency Level Classification

1. **Level 1**: Warning only, not flooded
2. **Level 2**: Adults only, stable conditions
3. **Level 3**: Has children/seniors OR water at second floor
4. **Level 4**: Very young children (<3 years) OR patients/bedridden OR unable to self-rescue
5. **Level 5**: Critical - water at roof level, infants in danger, medical emergency, deaths

## 🔒 Security & Privacy

- All API keys stored as environment variables
- Supabase Row Level Security (RLS) policies enforced
- No authentication required for rapid disaster response
- Data should be handled according to local privacy regulations
- Consider data retention policies for post-disaster cleanup

## 🤝 Contributing

Contributions are welcome! This is an open-source project aimed at improving disaster relief efforts.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas for Improvement

- [ ] Multi-language support beyond Thai
- [ ] Map visualization of victim locations
- [ ] SMS/WhatsApp integration for data collection
- [ ] Photo upload and OCR extraction
- [ ] Export functionality (CSV, PDF reports)
- [ ] Real-time notifications for critical cases
- [ ] Integration with rescue team dispatch systems
- [ ] Offline mode for areas with poor connectivity

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered full-stack development platform
- Powered by [Google Gemini](https://ai.google.dev/) for AI extraction and embeddings
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and backend by [Supabase](https://supabase.com/)

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check the [documentation](docs/)

## ⚠️ Important Notes

This system is designed for rapid deployment during disaster situations. While it includes duplicate detection and data validation, **always verify critical information** before dispatching rescue teams.

**Zero Hallucination Policy**: The AI extraction is configured to only extract explicitly stated information and never infer or generate data. However, always review extracted data in the Review page before saving.

---

**Made with ❤️ for disaster relief efforts**
