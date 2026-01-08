import { AppEvent, EventDetailView, EventKind } from "./models"

export function getEventDateText(event: AppEvent): string {
  if (event.type.kind === EventKind.Festival) {
    const [start, end] = event.type.dateRange
    return `${formatDate(start)} - ${formatDate(end)}`
  } else {
    return formatDate(event.date)
  }
}

export function buildEventDetailView(event: AppEvent): EventDetailView {
  const view: EventDetailView = {
    id: event.id,
    name: event.name,
    kindLabel: event.type.kind,
    dateText: getEventDateText(event)
  }
  if (event.venue !== undefined) view.venue = event.venue
  if (event.location !== undefined) view.location = event.location
  if (event.section !== undefined) view.section = event.section
  if (event.seat !== undefined) view.seat = event.seat
  if (event.row !== undefined) view.row = event.row
  if (event.notes !== undefined) view.notes = event.notes
  return view
}

export function buildAllEventDetailViews(events: AppEvent[]): EventDetailView[] {
  return events.map(buildEventDetailView)
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ""
  // Take only the YYYY-MM-DD portion before the T
  const [year, month, dayWithTime] = dateStr.split("-")
  const day = dayWithTime.split("T")[0] // remove time if present
  return `${month}/${day}/${year}`
}

export function formatForInputDate(dateStr: string | undefined): string {
  if (!dateStr) return ""
  return dateStr.split("T")[0] // take only the YYYY-MM-DD portion
}
