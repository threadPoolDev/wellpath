import { useEffect, useState } from 'react'
import { groupsApi, Group, GroupActivity, GroupInvite } from './api'
import { Avatar } from '@/components/Avatar'
import { useAuthStore } from '@/store/authStore'

export function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [invites, setInvites] = useState<GroupInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const currentUser = useAuthStore((s) => s.user)

  useEffect(() => {
    Promise.all([groupsApi.listGroups(), groupsApi.listInvites()])
      .then(([g, i]) => { setGroups(g); setInvites(i) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  async function handleAccept(inviteId: string) {
    await groupsApi.acceptInvite(inviteId)
    const [g, i] = await Promise.all([groupsApi.listGroups(), groupsApi.listInvites()])
    setGroups(g); setInvites(i)
  }

  async function handleDecline(inviteId: string) {
    await groupsApi.declineInvite(inviteId)
    setInvites((prev) => prev.filter((inv) => inv._id !== inviteId))
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {[1, 2].map((n) => <div key={n} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  if (view === 'create') {
    return <CreateGroupForm onCreated={(g) => { setGroups((prev) => [...prev, g]); setView('list') }} onBack={() => setView('list')} />
  }

  if (view === 'detail' && selectedGroupId) {
    return (
      <GroupDetail
        groupId={selectedGroupId}
        currentUserId={currentUser?.id ?? ''}
        onBack={() => { setView('list'); setSelectedGroupId(null) }}
        onLeft={() => {
          setGroups((prev) => prev.filter((g) => g._id !== selectedGroupId))
          setView('list')
          setSelectedGroupId(null)
        }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-stone-800">Groups</h1>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-stone-800 text-white text-sm rounded-xl hover:bg-stone-700 transition-colors"
        >
          + New group
        </button>
      </div>

      {/* Pending invites */}
      {invites.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Invites</p>
          {invites.map((inv) => (
            <div key={inv._id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-stone-700">{inv.groupName}</p>
                <p className="text-sm text-stone-500">Invited by {inv.invitedByName}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDecline(inv._id)}
                  className="px-3 py-1.5 text-sm text-stone-500 border border-stone-200 rounded-xl hover:bg-stone-50">
                  Decline
                </button>
                <button onClick={() => handleAccept(inv._id)}
                  className="px-3 py-1.5 text-sm text-white bg-stone-800 rounded-xl hover:bg-stone-700">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg mb-2">No groups yet</p>
          <p className="text-sm">Create one to share your progress with people you trust.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const activeMembers = g.members.filter((m) => m.status === 'active')
            return (
              <button
                key={g._id}
                onClick={() => { setSelectedGroupId(g._id); setView('detail') }}
                className="w-full text-left bg-white border border-stone-200 rounded-2xl p-4 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-700">{g.name}</p>
                    <p className="text-sm text-stone-400">{activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {activeMembers.slice(0, 4).map((m) => (
                      <Avatar key={m.userId} name={m.displayName} size="sm" variant="thumbnail" />
                    ))}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Group detail view ────────────────────────────────────────────────────────

function GroupDetail({ groupId, currentUserId, onBack, onLeft }: {
  groupId: string
  currentUserId: string
  onBack: () => void
  onLeft: () => void
}) {
  const [data, setData] = useState<{ group: Group; todayActivity: GroupActivity[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [leavingConfirm, setLeavingConfirm] = useState(false)

  useEffect(() => {
    groupsApi.getGroup(groupId)
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [groupId])

  async function handleInvite() {
    if (!inviteEmail) return
    setInviting(true)
    try {
      await groupsApi.invite(groupId, inviteEmail)
      setInviteEmail('')
      setInviteSent(true)
      setTimeout(() => setInviteSent(false), 2000)
    } catch (err) {
      console.error('[groups] invite failed:', err)
    } finally {
      setInviting(false)
    }
  }

  async function handleLeave() {
    await groupsApi.leaveGroup(groupId)
    onLeft()
  }

  if (loading || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        {[1, 2, 3].map((n) => <div key={n} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  const { group, todayActivity } = data
  const activeMembers = group.members.filter((m) => m.status === 'active')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1">
        ← Back
      </button>

      <h1 className="text-2xl font-semibold text-stone-800 mb-6">{group.name}</h1>

      {/* Members with activity */}
      <div className="space-y-3 mb-8">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Today's progress</p>
        {activeMembers.map((member) => {
          const activity = todayActivity.find((a) => a.userId === member.userId)
          const isMe = member.userId === currentUserId
          return (
            <div key={member.userId}
              className={`border rounded-2xl p-4 ${isMe ? 'border-stone-400 bg-stone-50' : 'border-stone-200 bg-white'}`}>
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={member.displayName} size="sm" variant="thumbnail" />
                <div className="flex-1">
                  <p className="font-medium text-stone-700">{member.displayName}{isMe ? ' (you)' : ''}</p>
                  {member.role === 'admin' && <p className="text-xs text-stone-400">Admin</p>}
                </div>
                {activity ? (
                  <div className="text-right">
                    <p className="font-semibold text-stone-700">
                      {activity.summary.completionPercentage}%
                      {activity.summary.completionPercentage === 100 && ' ⭐'}
                    </p>
                    <p className="text-xs text-stone-400">
                      {activity.summary.completedTasks}/{activity.summary.totalTasks} tasks
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-stone-300">No data yet</p>
                )}
              </div>

              {/* Completion bar */}
              {activity && (
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-600 rounded-full transition-all"
                    style={{ width: `${activity.summary.completionPercentage}%` }}
                  />
                </div>
              )}

              {/* Task details if shared */}
              {activity && activity.sharingPreference !== 'completion_only' && activity.summary.tasks.length > 0 && (
                <div className="mt-3 space-y-1">
                  {activity.summary.tasks.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span>{t.status === 'done' ? '✓' : '·'}</span>
                      <span className={t.status === 'done' ? 'text-stone-600' : 'text-stone-400'}>{t.title}</span>
                      {t.missedReason && (
                        <span className="text-xs text-stone-400 italic ml-1">"{t.missedReason}"</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Invite */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Invite someone</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="their@email.com"
            className="input-base flex-1"
          />
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail}
            className="px-4 py-2 bg-stone-800 text-white text-sm rounded-xl disabled:opacity-40 hover:bg-stone-700 transition-colors"
          >
            {inviteSent ? '✓ Sent' : inviting ? 'Sending...' : 'Invite'}
          </button>
        </div>
      </div>

      {/* Leave group */}
      <div className="border-t border-stone-100 pt-6">
        {leavingConfirm ? (
          <div className="flex gap-3 items-center">
            <p className="text-sm text-stone-500 flex-1">You can always come back.</p>
            <button onClick={() => setLeavingConfirm(false)} className="text-sm text-stone-400 hover:text-stone-600">Cancel</button>
            <button onClick={handleLeave} className="text-sm text-red-400 hover:text-red-600">Leave group</button>
          </div>
        ) : (
          <button onClick={() => setLeavingConfirm(true)} className="text-sm text-stone-400 hover:text-stone-600">
            Leave this group
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Create group form ────────────────────────────────────────────────────────

function CreateGroupForm({ onCreated, onBack }: { onCreated: (g: Group) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  function addEmail() {
    const email = emailInput.trim()
    if (!email || emails.includes(email)) return
    setEmails((prev) => [...prev, email])
    setEmailInput('')
  }

  async function handleCreate() {
    if (!name.trim()) return
    setIsCreating(true)
    try {
      const group = await groupsApi.createGroup(name.trim(), emails)
      onCreated(group)
    } catch (err) {
      console.error('[groups] create failed:', err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={onBack} className="text-sm text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1">
        ← Back
      </button>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Create a group</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Group name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work crew, Morning crew..." className="input-base" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">
            Invite people <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              placeholder="their@email.com"
              className="input-base flex-1"
            />
            <button onClick={addEmail}
              className="px-4 py-2 border border-stone-200 text-sm text-stone-600 rounded-xl hover:bg-stone-50 transition-colors">
              Add
            </button>
          </div>
          {emails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {emails.map((e) => (
                <span key={e} className="flex items-center gap-1.5 bg-stone-100 text-stone-600 text-sm px-3 py-1 rounded-full">
                  {e}
                  <button onClick={() => setEmails((prev) => prev.filter((x) => x !== e))}
                    className="text-stone-400 hover:text-stone-600 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          className="w-full py-3 bg-stone-800 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-700 transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create group'}
        </button>
      </div>
    </div>
  )
}
