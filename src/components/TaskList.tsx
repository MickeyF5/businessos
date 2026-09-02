import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import type { Priority, Task, UserProfile } from '../types'
import { VzmIcon } from './icons'
import { sortTasks, PRIORITY_CONFIG, formatDueDate, getStatusColor } from '../lib/utils'

interface TaskListProps {
  tasks: Task[]
  allUsers: UserProfile[]
  currentUserName?: string
  newTaskTitle: string
  newTaskAssignee: string
  newTaskPriority?: Priority
  onTaskTitleChange: (value: string) => void
  onTaskAssigneeChange: (value: string) => void
  onTaskAssigneeIdChange: (value: string | undefined) => void
  onTaskPriorityChange?: (value: Priority) => void
  onAddTask: (event: FormEvent) => void
  onToggleTask: (id: string) => void
  onDeleteTask: (id: string, event: MouseEvent) => void
}

export function TaskList({
  tasks,
  allUsers,
  currentUserName,
  newTaskTitle,
  newTaskAssignee,
  newTaskPriority = 'Medium',
  onTaskTitleChange,
  onTaskAssigneeChange,
  onTaskAssigneeIdChange,
  onTaskPriorityChange,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TaskListProps) {
  const [isMentionOpen, setIsMentionOpen] = useState(false)

  const mentionStart = newTaskAssignee.lastIndexOf('@')
  const mentionQuery = mentionStart >= 0 ? newTaskAssignee.slice(mentionStart + 1).toLowerCase() : ''
  const mentionOptions = allUsers.filter((user) => user.name.toLowerCase().includes(mentionQuery))

  const handleMentionInput = (value: string) => {
    onTaskAssigneeChange(value)
    onTaskAssigneeIdChange(undefined)
    setIsMentionOpen(value.includes('@'))
  }

  const handleSelectMention = (user: UserProfile) => {
    const beforeMention = newTaskAssignee.slice(0, mentionStart)
    onTaskAssigneeChange(`${beforeMention}@${user.name}`)
    onTaskAssigneeIdChange(user.id)
    setIsMentionOpen(false)
  }

  const getAssigneeName = (task: Task) => {
    if (task.assigneeId) {
      return allUsers.find((user) => user.id === task.assigneeId)?.name || task.assignee
    }
    return task.assignee || currentUserName || 'Unassigned'
  }

  const sortedTasks = sortTasks(tasks)
  const incompleteTasks = sortedTasks.filter((task) => !task.done)
  const completedTasks = sortedTasks.filter((task) => task.done)

  return (
    <div className="panel task-panel" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div className="panel-header">
        <h2 className="panel-title">Today / To-do</h2>
        <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>
          {incompleteTasks.length} active
        </span>
      </div>

      {/* Add New Task Form */}
      <form
        onSubmit={onAddTask}
        className="task-form"
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: '10px',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <select
          value={newTaskPriority}
          onChange={(event) => onTaskPriorityChange?.(event.target.value as Priority)}
          style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            color: PRIORITY_CONFIG[newTaskPriority].color,
            padding: '8px 10px',
            borderRadius: '6px',
            outline: 'none',
            fontWeight: '600',
            fontSize: '0.85rem',
          }}
        >
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        <input
          type="text"
          placeholder="New task..."
          value={newTaskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          className="field"
          style={{ gridColumn: 'span 2' }}
        />

        <div style={{ position: 'relative', gridColumn: 'span 2' }}>
          <input
            type="text"
            placeholder="@mention assignee"
            value={newTaskAssignee}
            onFocus={() => setIsMentionOpen(newTaskAssignee.includes('@'))}
            onChange={(event) => handleMentionInput(event.target.value)}
            className="field"
          />

          {isMentionOpen && mentionOptions.length > 0 && (
            <ul
              style={{
                position: 'absolute',
                zIndex: 2,
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                listStyle: 'none',
                padding: '5px',
                margin: 0,
                background: '#1b1b1b',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
              }}
            >
              {mentionOptions.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectMention(user)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: '#f5f5f5',
                      padding: '9px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>@{user.name}</strong>
                    <span
                      style={{
                        display: 'block',
                        color: '#a0a0a0',
                        fontSize: '0.75rem',
                        marginTop: '4px',
                      }}
                    >
                      {user.email}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="primary-button"
          style={{ gridColumn: 'span 2', justifyContent: 'center' }}
        >
          <VzmIcon name="plus" size={14} />
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {incompleteTasks.length === 0 && completedTasks.length === 0 ? (
          <div style={{ padding: '20px 16px', textAlign: 'center', color: '#a0a0a0' }}>
            <p>No high-priority tasks scheduled</p>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            {incompleteTasks.length > 0 && (
              <ul className="task-list" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {incompleteTasks.map((task) => {
                  const priority = task.priority || 'Medium'
                  const priorityConfig = PRIORITY_CONFIG[priority]
                  const statusColor = getStatusColor(task.due_date)

                  return (
                    <li
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`task-item ${task.done ? 'done' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      {/* Priority Badge + Task Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: priorityConfig.color,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {priorityConfig.icon}
                            {priorityConfig.label}
                          </span>
                          {task.overdue && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '2px 6px',
                                borderRadius: '3px',
                              }}
                            >
                              ⚠️ Overdue
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="task-state">
                            {task.done ? <VzmIcon name="check" size={12} /> : ''}
                          </span>
                          <span className="task-text">{task.title}</span>
                        </div>

                        {/* Task Metadata */}
                        <div
                          style={{
                            display: 'flex',
                            gap: '16px',
                            marginTop: '8px',
                            fontSize: '0.8rem',
                            color: '#a0a0a0',
                            flexWrap: 'wrap',
                          }}
                        >
                          {task.project_name && (
                            <span>
                              📁 <strong>{task.project_name}</strong>
                            </span>
                          )}
                          <span>👤 @{getAssigneeName(task)}</span>
                          {task.due_date && (
                            <span style={{ color: statusColor }}>
                              📅 {formatDueDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="task-action"
                        onClick={(event) => onDeleteTask(task.id, event)}
                        aria-label={`Delete ${task.title}`}
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      >
                        <VzmIcon name="delete" size={14} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div style={{ padding: '12px 16px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#a0a0a0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Completed ({completedTasks.length})
                </h3>
                <ul className="task-list">
                  {completedTasks.map((task) => (
                    <li
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className={`task-item ${task.done ? 'done' : ''}`}
                      style={{
                        cursor: 'pointer',
                        padding: '10px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        opacity: 0.6,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8'
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.6'
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span className="task-state">
                        <VzmIcon name="check" size={12} />
                      </span>
                      <span className="task-text" style={{ textDecoration: 'line-through' }}>
                        {task.title}
                      </span>
                      <button
                        type="button"
                        className="task-action"
                        onClick={(event) => onDeleteTask(task.id, event)}
                        aria-label={`Delete ${task.title}`}
                        style={{ marginLeft: 'auto' }}
                      >
                        <VzmIcon name="delete" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
