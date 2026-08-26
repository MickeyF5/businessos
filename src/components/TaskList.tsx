import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import type { Task, UserProfile } from '../types'
import { VzmIcon } from './icons'

interface TaskListProps {
  tasks: Task[]
  allUsers: UserProfile[]
  currentUserName?: string
  newTaskTitle: string
  newTaskAssignee: string
  onTaskTitleChange: (value: string) => void
  onTaskAssigneeChange: (value: string) => void
  onTaskAssigneeIdChange: (value: string | undefined) => void
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
  onTaskTitleChange,
  onTaskAssigneeChange,
  onTaskAssigneeIdChange,
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

  return (
    <div className="panel task-panel">
      <div className="panel-header">
        <h2 className="panel-title">Today / To-do</h2>
      </div>

      <form onSubmit={onAddTask} className="task-form">
        <input
          type="text"
          placeholder="New task..."
          value={newTaskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          className="field"
        />

        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="@mention assignee"
            value={newTaskAssignee}
            onFocus={() => setIsMentionOpen(newTaskAssignee.includes('@'))}
            onChange={(event) => handleMentionInput(event.target.value)}
            className="field"
          />

          {isMentionOpen && mentionOptions.length > 0 && (
            <ul style={{ position: 'absolute', zIndex: 2, top: 'calc(100% + 6px)', left: 0, right: 0, listStyle: 'none', padding: '5px', margin: 0, background: '#1b1b1b', border: '1px solid #2a2a2a', borderRadius: '12px', boxShadow: '0 18px 40px rgba(0,0,0,0.35)' }}>
              {mentionOptions.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectMention(user)}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#f5f5f5', padding: '9px 8px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <strong>@{user.name}</strong>
                    <span style={{ display: 'block', color: '#a0a0a0', fontSize: '0.75rem', marginTop: '4px' }}>{user.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="primary-button">
          <VzmIcon name="plus" size={14} />
          Add
        </button>
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} onClick={() => onToggleTask(task.id)} className={`task-item ${task.done ? 'done' : ''}`}>
            <div className="task-main">
              <span className="task-state">
                {task.done ? <VzmIcon name="check" size={12} /> : ''}
              </span>
              <span className="task-text">{task.title}</span>
            </div>

            <div className="task-meta">
              <span className="task-assignee">@{getAssigneeName(task)}</span>
              <button
                type="button"
                className="task-action"
                onClick={(event) => onDeleteTask(task.id, event)}
                aria-label={`Delete ${task.title}`}
              >
                <VzmIcon name="delete" size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
