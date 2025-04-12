import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './styles.css';
import EventModal from './EventModal';
import { useSelector, useDispatch } from 'react-redux';
import { addEvent, updateEvent } from './eventsSlice';
import { selectGoal } from './goalsSlice';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const startHour = 6;
const endHour = 22;

const categoryColors = {
  exercise: '#a3e635',
  eating: '#facc15',
  work: '#60a5fa',
  relax: '#f472b6',
  family: '#f87171',
  social: '#a78bfa',
};

const App = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const dispatch = useDispatch();
  const events = useSelector((state) => state.events);
  const goals = useSelector((state) => state.goals.list);
  const selectedGoalId = useSelector((state) => state.goals.selectedGoalId);
  const tasks = useSelector((state) => state.tasks);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const today = new Date();

  const visibleDays = viewMode === 'day'
    ? [days[today.getDay()]]
    : viewMode === 'week'
    ? days
    : [];

  const handleCellClick = (day, time) => {
    const currentDate = new Date();
    const dateOffset = days.indexOf(day) - currentDate.getDay();
    currentDate.setDate(currentDate.getDate() + dateOffset);
    const dateStr = currentDate.toISOString().split('T')[0];

    setModalData({
      title: '',
      category: '',
      date: dateStr,
      startTime: time,
      endTime: time,
    });
    setModalOpen(true);
  };

  const handleSaveEvent = async (newEvent) => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) throw new Error('Failed to save event');

      const savedEvent = await response.json();

      dispatch(addEvent({ ...savedEvent }));
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const getEventStyle = (event) => {
    const [sh, sm] = event.startTime.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    const height = ((endMinutes - startMinutes) / 15) * 40;
    const top = ((startMinutes - startHour * 60) / 15) * 40;

    return {
      top: `${top}px`,
      height: `${height}px`,
      backgroundColor: categoryColors[event.category] || '#ccc',
    };
  };

  const handleDrop = (e, newDay, newTime) => {
    const taskId = e.dataTransfer.getData('task-id');
    const goalId = e.dataTransfer.getData('goal-id');

    if (taskId && goalId) {
      const goal = goals.find((g) => g.id === parseInt(goalId));
      const task = tasks.find((t) => t.id === parseInt(taskId));

      const newDate = new Date();
      const dayOffset = days.indexOf(newDay) - newDate.getDay();
      newDate.setDate(newDate.getDate() + dayOffset);

      setModalData({
        title: task.name,
        category: goal.name.toLowerCase(),
        date: newDate.toISOString().split('T')[0],
        startTime: newTime,
        endTime: newTime,
      });

      setModalOpen(true);
      return;
    }

    const eventId = parseInt(e.dataTransfer.getData('event-id'));
    const event = events.find((ev) => ev.id === eventId);
    if (!event) return;

    const duration =
      (parseInt(event.endTime.split(':')[0]) * 60 +
        parseInt(event.endTime.split(':')[1])) -
      (parseInt(event.startTime.split(':')[0]) * 60 +
        parseInt(event.startTime.split(':')[1]));

    const [hour, minute] = newTime.split(':');
    const newStartMinutes = parseInt(hour) * 60 + parseInt(minute);
    const newEndMinutes = newStartMinutes + duration;

    const newEndHour = String(Math.floor(newEndMinutes / 60)).padStart(2, '0');
    const newEndMin = String(newEndMinutes % 60).padStart(2, '0');

    const newDate = new Date();
    const dayOffset = days.indexOf(newDay) - newDate.getDay();
    newDate.setDate(newDate.getDate() + dayOffset);

    dispatch(updateEvent({
      ...event,
      date: newDate.toISOString().split('T')[0],
      startTime: newTime,
      endTime: `${newEndHour}:${newEndMin}`,
    }));
  };

  const handleResizeStart = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const initialEnd = event.endTime;

    const onMouseMove = (moveEvent) => {
      const diffY = moveEvent.clientY - startY;
      const slotHeight = 40;
      const offsetSlots = Math.round(diffY / slotHeight);
      const [eh, em] = initialEnd.split(':').map(Number);
      const total = eh * 60 + em + offsetSlots * 15;

      const newHour = String(Math.floor(total / 60)).padStart(2, '0');
      const newMin = String(total % 60).padStart(2, '0');
      dispatch(updateEvent({ ...event, endTime: `${newHour}:${newMin}` }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderMonthTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dayEvents = events.filter(
      (ev) => new Date(ev.date).toDateString() === date.toDateString()
    );
    return (
      <ul className="event-list">
        {dayEvents.map((ev) => (
          <li
            key={ev.id}
            style={{
              backgroundColor: categoryColors[ev.category] || '#ccc',
              color: '#fff',
              fontSize: '0.7rem',
              padding: '2px 4px',
              borderRadius: '4px',
              marginBottom: '2px',
            }}
          >
            {ev.title}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Goals</h2>
        <ul>
          {goals.map((goal) => (
            <li
              key={goal.id}
              style={{ color: goal.color, cursor: 'pointer' }}
              onClick={() => dispatch(selectGoal(goal.id))}
            >
              {goal.name}
            </li>
          ))}
        </ul>

        {selectedGoalId && (
          <>
            <h3>Tasks</h3>
            <ul>
              {tasks
                .filter((task) => task.goalId === selectedGoalId)
                .map((task) => {
                  const goal = goals.find((g) => g.id === task.goalId);
                  return (
                    <li
                      key={task.id}
                      className="task-item"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('task-id', task.id);
                        e.dataTransfer.setData('goal-id', goal.id);
                      }}
                      style={{
                        color: goal.color,
                        borderLeft: `4px solid ${goal.color}`,
                        paddingLeft: '6px',
                        background: '#f9f9f9',
                        margin: '4px 0',
                        borderRadius: '4px',
                        cursor: 'grab',
                      }}
                    >
                      {task.name}
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <h2>{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</h2>
          <div>
            <button onClick={() => setViewMode('day')}>Day</button>
            <button onClick={() => setViewMode('week')}>Week</button>
            <button onClick={() => setViewMode('month')}>Month</button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <div className="month-view">
            <Calendar
              onClickDay={(date) => {
                setModalData({
                  title: '',
                  category: '',
                  date: date.toISOString().split('T')[0],
                  startTime: '09:00',
                  endTime: '10:00',
                });
                setModalOpen(true);
              }}
              tileContent={renderMonthTileContent}
              value={selectedDate}
              onChange={setSelectedDate}
            />
          </div>
        ) : (
          <div className="calendar-body">
            <div className="time-col">
              <div className="day-header-placeholder" />
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="time-slot-label">{slot}</div>
              ))}
            </div>

            {visibleDays.map((day) => (
              <div key={day} className="day-column">
                <div className="day-header">{day}</div>
                {timeSlots.map((time, idx) => (
                  <div
                    key={idx}
                    className="time-slot"
                    onClick={() => handleCellClick(day, time)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, day, time)}
                  />
                ))}

                {events
                  .filter((ev) => {
                    const evDate = new Date(ev.date);
                    const targetDate = new Date();
                    targetDate.setDate(today.getDate() + (days.indexOf(day) - today.getDay()));
                    return evDate.toDateString() === targetDate.toDateString();
                  })
                  .map((ev, idx) => (
                    <div
                      key={idx}
                      className="event-tile"
                      style={getEventStyle(ev)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('event-id', ev.id);
                      }}
                    >
                      {ev.title}
                      <div
                        className="resize-handle"
                        onMouseDown={(e) => handleResizeStart(e, ev)}
                      ></div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        defaultData={modalData}
      />
    </div>
  );
};

export default App;
