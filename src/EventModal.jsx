import React, { useState, useEffect } from "react";
import "./styles.css";

const EventModal = ({ isOpen, onClose, onSave, defaultData }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Exercise");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (defaultData) {
      setTitle(defaultData.title || "");
      setCategory(defaultData.category || "Exercise");
      setDate(defaultData.date || "");

      if (defaultData.date && defaultData.startTime) {
        setStartTime(`${defaultData.date}T${defaultData.startTime}`);
      } else {
        setStartTime("");
      }

      if (defaultData.date && defaultData.endTime) {
        setEndTime(`${defaultData.date}T${defaultData.endTime}`);
      } else {
        setEndTime("");
      }
    }
  }, [defaultData]);

  const handleSaveClick = () => {
    const parsedDate = startTime.split("T")[0];
    const parsedStart = startTime.split("T")[1];
    const parsedEnd = endTime.split("T")[1];

    onSave({
      title,
      category,
      date: parsedDate,
      startTime: parsedStart,
      endTime: parsedEnd,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>➕ Create New Event</h2>

        <label>📌 Title</label>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>📂 Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Exercise">Exercise</option>
          <option value="Meeting">Meeting</option>
          <option value="Work">Work</option>
          <option value="Leisure">Leisure</option>
        </select>

        <label>📅 Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>🕓 End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="create-btn" onClick={handleSaveClick}>
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
