import { describe, expect, it } from "vitest";
import { overdueLabel, unreadCount, type FollowUpReminder } from "./reminders";

const reminder = (id: string, readAt: string | null): FollowUpReminder => ({
  id,
  taskId: `task-${id}`,
  dueAt: "2026-10-20T10:00:00Z",
  createdAt: "2026-10-20T10:05:00Z",
  readAt,
  task: {
    id: `task-${id}`,
    title: "Llamar",
    dueAt: null,
    lead: { id: "l1", name: "Ana", destination: null },
  },
});

describe("reminders helpers", () => {
  it("counts only unread reminders", () => {
    expect(
      unreadCount([reminder("1", null), reminder("2", "2026-10-20T11:00:00Z")]),
    ).toBe(1);
  });

  it("describes how long a follow-up has been overdue", () => {
    const now = Date.parse("2026-10-21T12:00:00Z");
    expect(overdueLabel("2026-10-21T11:30:00Z", now)).toBe(
      "vencido hace menos de 1 h",
    );
    expect(overdueLabel("2026-10-21T07:00:00Z", now)).toBe("vencido hace 5 h");
    expect(overdueLabel("2026-10-19T12:00:00Z", now)).toBe(
      "vencido hace 2 días",
    );
  });
});
