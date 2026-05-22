export interface Announcement {
  id: string;
  title: string;
  content: string;
  exam_category: string | null;
  published_at: string;
  link_url?: string;
  link_text?: string;
}

export const DEFAULT_MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "mock-1",
    title: "GATE 2027 Portal & Schedules Released",
    content: "The official GATE 2027 portal is now live. Online applications will open shortly. Key revisions have been made to the Data Science and Systems Engineering papers. Check the updated syllabus details in our Central Exams track.",
    exam_category: "GATE",
    published_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
    link_url: "https://gate2027.iitr.ac.in",
    link_text: "Official GATE Portal ↗"
  },
  {
    id: "mock-2",
    title: "Important: Exam Registrations Start Timeline",
    content: "Exam registrations usually commence exactly 3 months before the scheduled exam date. Because each board operates on a unique schedule, please check your preparation track details or the official board portal to verify the exact window.",
    exam_category: "IMPORTANT",
    published_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "mock-3",
    title: "NEET UG 2026 Registration Portal Open",
    content: "National Testing Agency (NTA) has officially opened the online registration window for NEET UG 2026. Make sure to review the official information bulletin, prepare your documents (photo, signature, thumb impression), and register before the deadline.",
    exam_category: "NEET",
    published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
    link_url: "https://neet.nta.nic.in",
    link_text: "NEET Registration Portal ↗"
  },
  {
    id: "mock-4",
    title: "CBSE Class 10 & 12 Board Exam Schedule",
    content: "The Central Board of Secondary Education (CBSE) has released the tentative datesheets for Class 10 and Class 12 board examinations. Students are advised to download the PDF schedule and check the specific instructions.",
    exam_category: "BOARDS",
    published_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), // 2 days ago
    link_url: "https://www.cbse.gov.in",
    link_text: "CBSE Official Website ↗"
  },
  {
    id: "mock-5",
    title: "Analytics Center v2 Rolling Out Next Week",
    content: "Our updated performance dashboard is releasing soon! Gain access to AI-powered weakness detection, mock test comparison metrics, and real-time speed analysis.",
    exam_category: "SYSTEM",
    published_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), // 5 days ago
  }
];

