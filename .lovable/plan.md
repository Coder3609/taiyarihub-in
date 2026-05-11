## Live Tests Feature

Add a "Live Tests" section below "Select Your Exam Type" on the dashboard, with scheduled exams, real-time status (Upcoming / Live / Ended), per-exam leaderboard, and admin controls to create live tests.

### User Flow
1. On dashboard, user sees a new **Live Tests** section.
2. User picks an exam from a dropdown (all platform exams listed).
3. Cards show all live tests for that exam with status:
   - **Upcoming** – countdown to start, "Register" button
   - **Live** – "Join Now" button (opens quiz with fixed duration)
   - **Ended** – "View Leaderboard" + "View Results" button
4. Leaderboard ranks users by score, then by time taken.
5. Admin Panel gets a new "Live Tests" tab to create/edit/delete live tests.

### Database (new tables)

`live_tests`
- exam_slug (text), title, description
- start_at (timestamptz), end_at (timestamptz), duration_minutes (int)
- question_set jsonb (array of questions same shape as quiz) OR reference to existing source/set
- created_by (uuid), is_published (bool)

`live_test_attempts`
- live_test_id (fk), user_id, score (int), total (int), time_taken_seconds (int)
- answers jsonb, submitted_at
- unique(live_test_id, user_id) — one attempt per user

RLS:
- live_tests: anyone can SELECT where is_published; admins can do all.
- live_test_attempts: user can insert/update own; everyone can SELECT (for leaderboard); admins all.

### Frontend Files
- `src/components/LiveTestsSection.tsx` — new dashboard section with exam dropdown + cards + countdown + status badges.
- `src/pages/LiveTest.tsx` — quiz runner for a live test (reuses Quiz logic, locked to live window).
- `src/pages/LiveTestLeaderboard.tsx` — ranked table with rank, name, score, time.
- `src/pages/AdminPanel.tsx` — add a "Live Tests" tab: form (exam, title, schedule, duration, questions JSON) + list.
- `src/pages/Dashboard.tsx` — mount `<LiveTestsSection />` directly below the exam category section.
- `src/App.tsx` — register `/live-test/:id` and `/live-test/:id/leaderboard` routes.

### Status Logic
Computed client-side from `now()` vs `start_at` / `end_at`:
- now < start_at → Upcoming
- start_at ≤ now ≤ end_at → Live
- now > end_at → Ended

### Notes
- Reuses existing exam list (same source as profile dropdown / ExamCategoryDialog targets).
- Leaderboard sort: score DESC, time_taken_seconds ASC.
- Anti-cheat: enforce server-side `submitted_at` and reject submissions outside window via a check in insert (trigger).

Approve to proceed and I'll create the migration first, then build the UI.