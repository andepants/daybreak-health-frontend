/**
 * Unit tests for calendar link utilities
 *
 * Tests cover:
 * - Google Calendar URL generation
 * - ICS file content generation
 * - ICS file download functionality
 * - Date formatting for calendar formats
 * - Event details encoding
 *
 * Acceptance Criteria Tested:
 * - AC-5.4.3: ICS calendar file is downloaded for selected platform
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateGoogleCalendarUrl,
  generateICSFile,
  downloadICSFile,
  type CalendarEventDetails,
} from "@/lib/utils/calendar-links";

describe("calendar-links utilities", () => {
  const mockEventDetails: CalendarEventDetails = {
    title: "Therapy Appointment with Dr. Sarah Johnson",
    description: "Your scheduled therapy appointment with Daybreak Health.",
    location: "https://daybreak.health/meet/abc123",
    startTime: "2024-01-15T14:00:00Z",
    endTime: "2024-01-15T14:50:00Z",
  };

  describe("generateGoogleCalendarUrl", () => {
    it("should generate valid Google Calendar URL", () => {
      const url = generateGoogleCalendarUrl(mockEventDetails);

      expect(url).toContain("https://calendar.google.com/calendar/render?");
      expect(url).toContain("action=TEMPLATE");
    });

    it("should include event title in URL", () => {
      const url = generateGoogleCalendarUrl(mockEventDetails);

      expect(url).toContain(
        encodeURIComponent("Therapy Appointment with Dr. Sarah Johnson")
      );
    });

    it("should include event description in URL", () => {
      const url = generateGoogleCalendarUrl(mockEventDetails);

      expect(url).toContain(
        encodeURIComponent("Your scheduled therapy appointment with Daybreak Health.")
      );
    });

    it("should include location (meeting URL) in URL", () => {
      const url = generateGoogleCalendarUrl(mockEventDetails);

      expect(url).toContain(
        encodeURIComponent("https://daybreak.health/meet/abc123")
      );
    });

    it("should format dates correctly for Google Calendar", () => {
      const url = generateGoogleCalendarUrl(mockEventDetails);

      // Google Calendar expects: 20240115T140000Z/20240115T145000Z
      expect(url).toContain("20240115T140000Z");
      expect(url).toContain("20240115T145000Z");
    });

    it("should handle special characters in event details", () => {
      const specialEventDetails: CalendarEventDetails = {
        title: "Appointment & Meeting (Important!)",
        description: "Please review: https://example.com?param=value&other=123",
        location: "Video Call: https://meet.example.com/room-123",
        startTime: "2024-01-15T14:00:00Z",
        endTime: "2024-01-15T14:50:00Z",
      };

      const url = generateGoogleCalendarUrl(specialEventDetails);

      expect(url).toContain(encodeURIComponent("Appointment & Meeting (Important!)"));
      expect(url).toContain(encodeURIComponent("https://example.com?param=value&other=123"));
    });
  });

  describe("generateICSFile", () => {
    it("should generate valid ICS file data URI", () => {
      const icsUri = generateICSFile(mockEventDetails);

      expect(icsUri).toContain("blob:");
    });

    it("should include ICS file headers", async () => {
      const icsUri = generateICSFile(mockEventDetails);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("BEGIN:VCALENDAR");
      expect(content).toContain("VERSION:2.0");
      expect(content).toContain("PRODID:-//Daybreak Health//Appointment Booking//EN");
      expect(content).toContain("END:VCALENDAR");
    });

    it("should include event details in ICS format", async () => {
      const icsUri = generateICSFile(mockEventDetails);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("BEGIN:VEVENT");
      expect(content).toContain("SUMMARY:Therapy Appointment with Dr. Sarah Johnson");
      expect(content).toContain("LOCATION:https://daybreak.health/meet/abc123");
      expect(content).toContain("END:VEVENT");
    });

    it("should format dates correctly for ICS", async () => {
      const icsUri = generateICSFile(mockEventDetails);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("DTSTART:20240115T140000Z");
      expect(content).toContain("DTEND:20240115T145000Z");
    });

    it("should include 15-minute reminder alarm", async () => {
      const icsUri = generateICSFile(mockEventDetails);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("BEGIN:VALARM");
      expect(content).toContain("TRIGGER:-PT15M");
      expect(content).toContain("ACTION:DISPLAY");
      expect(content).toContain("END:VALARM");
    });

    it("should escape newlines in description", async () => {
      const eventWithMultilineDescription: CalendarEventDetails = {
        ...mockEventDetails,
        description: "Line 1\nLine 2\nLine 3",
      };

      const icsUri = generateICSFile(eventWithMultilineDescription);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("DESCRIPTION:Line 1\\nLine 2\\nLine 3");
    });

    it("should set status to CONFIRMED", async () => {
      const icsUri = generateICSFile(mockEventDetails);
      const response = await fetch(icsUri);
      const content = await response.text();

      expect(content).toContain("STATUS:CONFIRMED");
    });
  });

  describe("downloadICSFile", () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Create a mock anchor element
      mockLink = {
        href: "",
        download: "",
        click: vi.fn(),
      } as unknown as HTMLAnchorElement;

      // Spy on document methods
      createElementSpy = vi.spyOn(document, "createElement").mockReturnValue(mockLink);
      appendChildSpy = vi.spyOn(document.body, "appendChild").mockReturnValue(mockLink);
      removeChildSpy = vi.spyOn(document.body, "removeChild").mockReturnValue(mockLink);

      // Mock URL methods
      vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
      vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should create and click a download link", () => {
      downloadICSFile(mockEventDetails, "test-appointment.ics");

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(mockLink.click).toHaveBeenCalled();
    });

    it("should set correct filename", () => {
      downloadICSFile(mockEventDetails, "daybreak-appointment.ics");

      expect(mockLink.download).toBe("daybreak-appointment.ics");
    });

    it("should use default filename if not provided", () => {
      downloadICSFile(mockEventDetails);

      expect(mockLink.download).toBe("appointment.ics");
    });

    it("should append and remove link from DOM", () => {
      downloadICSFile(mockEventDetails, "test.ics");

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it("should set href to blob URL", () => {
      downloadICSFile(mockEventDetails, "test.ics");

      expect(mockLink.href).toBe("blob:mock-url");
    });

    it("should revoke object URL after download", () => {
      vi.useFakeTimers();
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

      downloadICSFile(mockEventDetails, "test.ics");

      vi.advanceTimersByTime(100);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");

      vi.useRealTimers();
    });
  });
});
