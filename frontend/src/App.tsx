import React, { useEffect, useState } from "react"
import { EventForm } from "./lib/EventForm"
import { AppEvent, EventDetailView } from "./lib/models"
import { buildAllEventDetailViews } from "./lib/viewModels"
import { sortEvents, SortDirection } from "./lib/sort"
import * as api from "./lib/api"

export const App: React.FC = () => {
  // Store raw AppEvent objects
  const [appEvents, setAppEvents] = useState<AppEvent[]>([])
  const [sortKey, setSortKey] = useState<keyof EventDetailView>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<AppEvent | undefined>(undefined)

  // Derived EventDetailViews for the table
  const sortedEvents = sortEvents(buildAllEventDetailViews(appEvents), sortKey, sortDirection)

  // Load events from backend
  useEffect(() => {
    api.fetchEvents().then(result => {
      if (result.ok) setAppEvents(result.data)
    })
  }, [])

  // Sorting handler
  const handleSort = (key: keyof EventDetailView) => {
    const direction = sortKey === key && sortDirection === "asc" ? "desc" : "asc"
    setSortKey(key)
    setSortDirection(direction)
  }

  // Delete an event
  const handleDelete = async (id: number) => {
    const result = await api.deleteEvent(id)
    if (result.ok) {
      setAppEvents(prev => prev.filter(e => e.id !== id))
    } else {
      alert(result.error)
    }
  }

  // Open modal for adding
  const openAddModal = () => {
    setEditingEvent(undefined)
    setModalOpen(true)
  }

  // Open modal for editing
  const openEditModal = (event: AppEvent) => {
    setEditingEvent(event)
    setModalOpen(true)
  }

  // Called after adding or editing an event
  const handleSave = (savedEvent: AppEvent) => {
    setAppEvents(prev => {
      const exists = prev.find(e => e.id === savedEvent.id)
      if (exists) {
        // Update
        return prev.map(e => (e.id === savedEvent.id ? savedEvent : e))
      } else {
        // Add
        return [...prev, savedEvent]
      }
    })
    setModalOpen(false)
  }

  return (
    <div>
      <h1>My Events</h1>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("name")}>Name</th>
            <th onClick={() => handleSort("kindLabel")}>Type</th>
            <th onClick={() => handleSort("dateText")}>Date</th>
            <th>Venue</th>
            <th>City/State/Country</th>
            <th>Section</th>
            <th>Row</th>
            <th>Seat</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map(e => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.kindLabel}</td>
              <td>{e.dateText}</td>
              <td>{e.venue}</td>
              <td>{e.location}</td>
              <td>{e.section}</td>
              <td>{e.row}</td>
              <td>{e.seat}</td>
              <td>{e.notes}</td>
              <td>
                <button onClick={() => openEditModal(appEvents.find(ev => ev.id === e.id)!)}>Edit</button>
                <button onClick={() => handleDelete(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={openAddModal}>Add Event</button>

      {modalOpen && <EventForm event={editingEvent} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}

export default App
