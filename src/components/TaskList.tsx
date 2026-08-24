import { useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import type { Task, UserProfile } from '../types'

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
  onToggleTask: (id: number) => void
  onDeleteTask: (id: number, event: MouseEvent) => void
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
    <div style={{ background: '#141414', padding: '20px', borderRadius: '8px', border: '1px solid #222' }}>
      <h2>TODAY / TO-DO</h2>

      <form onSubmit={onAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '15px', alignItems: 'flex-start' }}>
        <input
          type="text"
          placeholder="New task..."
          value={newTaskTitle}
          onChange={(event) => onTaskTitleChange(event.target.value)}
          style={{ flex: 2, background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '4px', outline: 'none' }}
        />
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="@mention assignee"
            value={newTaskAssignee}
            onFocus={() => setIsMentionOpen(newTaskAssignee.includes('@'))}
            onChange={(event) => handleMentionInput(event.target.value)}
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '4px', outline: 'none' }}
          />
          {isMentionOpen && mentionOptions.length > 0 && (
            <ul style={{ position: 'absolute', zIndex: 2, top: 'calc(100% + 4px)', left: 0, right: 0, listStyle: 'none', padding: '4px', margin: 0, background: '#1f1f1f', border: '1px solid #3b3b3b', borderRadius: '6px', boxShadow: '0 8px 18px rgba(0,0,0,0.35)' }}>
              {mentionOptions.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectMention(user)}
                    style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fff', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    <strong>@{user.name}</strong>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem' }}>{user.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add
        </button>
      </form>

      <ul className="task-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#1a1a1a',
              borderRadius: '4px',
              cursor: 'pointer',
              borderLeft: task.done ? '4px solid #22c55e' : '4px solid #3b82f6',
              opacity: task.done ? 0.6 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>{task.done ? '[x]' : '[ ]'}</span>
              <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <small style={{ color: '#888', background: '#222', padding: '2px 6px', borderRadius: '4px' }}>
                @{getAssigneeName(task)}
              </small>
              <button
                onClick={(event) => onDeleteTask(task.id, event)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
