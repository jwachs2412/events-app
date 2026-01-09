import React, { useState } from "react"
import { createPortal } from "react-dom"
import { AppEvent, EventKind, EventType, NewEventInput } from "./models"
import { formatForInputDate } from "./viewModels"
import * as api from "./api"

type EventFormProps = {
  event?: AppEvent // If provided, we're editing
  onClose: () => void // Close the modal
  onSave: (event: AppEvent) => void // Callback after saving
}

export const EventForm: React.FC<EventFormProps> = ({ event, onClose, onSave }) => {
  const [name, setName] = useState(event?.name ?? "")
  const [kind, setKind] = useState<EventKind>(event?.type.kind ?? EventKind.Concert)
  const [date, setDate] = useState(formatForInputDate(event?.date))
  const [startDate, setStartDate] = useState(event?.type.kind === EventKind.Festival ? formatForInputDate(event.type.dateRange[0]) : "")
  const [endDate, setEndDate] = useState(event?.type.kind === EventKind.Festival ? formatForInputDate(event.type.dateRange[1]) : "")
  const [venue, setVenue] = useState(event?.venue ?? "")
  const [location, setLocation] = useState(event?.location ?? "")
  const [section, setSection] = useState(event?.section ?? "")
  const [row, setRow] = useState(event?.row ?? "")
  const [seat, setSeat] = useState(event?.seat ?? "")
  const [notes, setNotes] = useState(event?.notes ?? "")

  const isFestival = kind === EventKind.Festival

  const handleSave = async () => {
    try {
      let type: EventType
      if (isFestival) type = { kind, dateRange: [startDate, endDate] }
      else type = { kind }

      const newEvent: NewEventInput = {
        name,
        type,
        date: isFestival ? undefined : date,
        venue,
        location,
        section,
        row,
        seat,
        notes
      }

      const result = event ? await api.editEvent(event.id, newEvent) : await api.addEvent(newEvent)

      if (result.ok) onSave(result.data)
      else alert(result.error)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  // Modal JSX
  const modalContent = (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{event ? "Edit Event" : "Add Event"}</h2>
        <label>
          Name:
          <input value={name} onChange={e => setName(e.target.value)} />
        </label>

        <label>
          Type:
          <select value={kind} onChange={e => setKind(e.target.value as EventKind)}>
            {Object.values(EventKind).map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        {isFestival ? (
          <>
            <label>
              Start Date:
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label>
              End Date:
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
          </>
        ) : (
          <label>
            Date:
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        )}

        <label>
          Venue:
          <input value={venue} onChange={e => setVenue(e.target.value)} />
        </label>

        <label>
          Location:
          <input value={location} onChange={e => setLocation(e.target.value)} />
        </label>

        <label>
          Section:
          <input value={section} onChange={e => setSection(e.target.value)} />
        </label>

        <label>
          Row:
          <input value={row} onChange={e => setRow(e.target.value)} />
        </label>

        <label>
          Seat:
          <input value={seat} onChange={e => setSeat(e.target.value)} />
        </label>

        <label>
          Notes:
          <textarea value={notes} onChange={e => setNotes(e.target.value)} />
        </label>
        <div className="modal-buttons">
          <button onClick={handleSave}>{event ? "Save" : "Add"}</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )

  // Render in portal
  return createPortal(modalContent, document.getElementById("modal-root")!)
}
