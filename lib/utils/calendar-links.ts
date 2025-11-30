/**
 * Calendar Links Utilities
 *
 * Generates calendar links and ICS file downloads for appointments.
 * Supports Google Calendar, Apple Calendar (iCal), and Outlook.
 *
 * @module lib/utils/calendar-links
 */

/**
 * Calendar event details for generating links
 */
export interface CalendarEventDetails {
  /** Event title (e.g., "Therapy Appointment with Dr. Smith") */
  title: string;
  /** Event description with additional context */
  description: string;
  /** Event location (typically the video call URL) */
  location: string;
  /** Start date/time as ISO string */
  startTime: string;
  /** End date/time as ISO string */
  endTime: string;
}

/**
 * Formats a date for calendar formats (YYYYMMDDTHHmmssZ)
 * Uses UTC methods to prevent timezone conversion issues
 * @param dateString - ISO date string
 * @returns Formatted date string for calendar APIs
 */
function formatCalendarDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generates a Google Calendar add event URL
 * Opens in a new tab to add event to user's Google Calendar
 *
 * @param event - Event details
 * @returns URL for Google Calendar
 *
 * @example
 * const url = generateGoogleCalendarUrl({
 *   title: "Therapy Session",
 *   description: "Video call with therapist",
 *   location: "https://daybreak.health/meet/abc123",
 *   startTime: "2024-01-15T14:00:00Z",
 *   endTime: "2024-01-15T14:50:00Z"
 * });
 */
export function generateGoogleCalendarUrl(event: CalendarEventDetails): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${formatCalendarDate(event.startTime)}/${formatCalendarDate(event.endTime)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates ICS file content for Apple Calendar and Outlook
 * Returns a data URI that can be downloaded as a .ics file
 *
 * ICS Format Reference: RFC 5545 (iCalendar)
 *
 * @param event - Event details
 * @returns Data URI for .ics file download
 *
 * @example
 * const icsUri = generateICSFile({
 *   title: "Therapy Session",
 *   description: "Video call with therapist",
 *   location: "https://daybreak.health/meet/abc123",
 *   startTime: "2024-01-15T14:00:00Z",
 *   endTime: "2024-01-15T14:50:00Z"
 * });
 * // Use in anchor: <a href={icsUri} download="appointment.ics">Download</a>
 */
export function generateICSFile(event: CalendarEventDetails): string {
  const startDate = formatCalendarDate(event.startTime);
  const endDate = formatCalendarDate(event.endTime);
  const now = formatCalendarDate(new Date().toISOString());

  // ICS file format (RFC 5545)
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Daybreak Health//Appointment Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `DTSTAMP:${now}`,
    `UID:${now}@daybreakhealth.com`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder: Appointment in 15 minutes",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  // Create data URI for download
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  return URL.createObjectURL(blob);
}

/**
 * Triggers a download of an ICS file
 * Creates a temporary anchor element to initiate the download
 *
 * @param event - Event details
 * @param filename - Name for downloaded file (default: "appointment.ics")
 *
 * @example
 * downloadICSFile({
 *   title: "Therapy Session",
 *   description: "Video call with therapist",
 *   location: "https://daybreak.health/meet/abc123",
 *   startTime: "2024-01-15T14:00:00Z",
 *   endTime: "2024-01-15T14:50:00Z"
 * }, "daybreak-appointment.ics");
 */
export function downloadICSFile(
  event: CalendarEventDetails,
  filename: string = "appointment.ics"
): void {
  const icsUri = generateICSFile(event);

  // Create temporary anchor for download
  const link = document.createElement("a");
  link.href = icsUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(icsUri), 100);
}
