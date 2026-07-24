# Wiring exam results into a Google Sheet

> **Moved.** Exam-results reporting is the same for every course, so the
> setup guide now lives in one shared place:
>
> **[`docs/EXAM-RESULTS-SETUP.md`](../../docs/EXAM-RESULTS-SETUP.md)**
>
> It covers the one-time Google Sheet + Apps Script setup, the payload
> shape (with the stable `attemptId` / `candidateId` / `courseId` /
> `role` identifiers), how to test the webhook, and Looker Studio
> reporting. Point this course's `exam.json` `webhookUrl` at the same
> deployed URL as every other course.
