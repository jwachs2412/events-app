import React, { useState } from "react"
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
  const [section, setSection] = useState(event?.section ?? "")
  const [row, setRow] = useState(event?.row ?? "")
  const [seat, setSeat] = useState(event?.seat ?? "")
  const [notes, setNotes] = useState(event?.notes ?? "")

  const isFestival = kind === EventKind.Festival

  const handleSave = async () => {
    try {
      let type: EventType
      if (isFestival) {
        type = { kind, dateRange: [startDate, endDate] }
      } else {
        type = { kind }
      }

      const newEvent: NewEventInput = {
        name,
        type,
        date: isFestival ? undefined : date,
        section,
        row,
        seat,
        notes
      }

      if (event) {
        const result = await api.editEvent(event.id, newEvent)
        if (result.ok) onSave(result.data)
        else alert(result.error)
      } else {
        const result = await api.addEvent(newEvent)
        if (result.ok) onSave(result.data)
        else alert(result.error)
      }

      onClose()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
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
}
