import { useEffect, useState } from 'react'
import { groupsApi, Group, GroupActivity } from '../api'
import { MemberCard } from './MemberCard'
import { GroupSettings } from './GroupSettings'

interface GroupDetailProps {
  groupId: string
  currentUserId: string
  onBack?: () => void
  onLeft: () => void
}

export function GroupDetail({ groupId, currentUserId, onBack, onLeft }: GroupDetailProps) {
  const [data, setData] = useState<{ group: Group; todayActivity: GroupActivity[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setLoading(true)
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

  if (loading || !data) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-20 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const { group, todayActivity } = data
  const activeMembers = group.members.filter((m) => m.status === 'active')

  if (showSettings) {
    return (
      <GroupSettings
        groupId={groupId}
        groupName={group.name}
        onBack={() => setShowSettings(false)}
        onLeft={onLeft}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-700 shrink-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 lg:hidden"
            aria-label="Back to list"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <h2 className="flex-1 text-lg font-semibold text-stone-800 dark:text-stone-100 truncate">{group.name}</h2>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="Group settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      <div className="flex-1 p-5 space-y-6">
        {/* Member activity */}
        <div>
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-3">
            Today's progress
          </p>
          <div className="space-y-3">
            {activeMembers.map((member) => (
              <MemberCard
                key={member.userId}
                member={member}
                activity={todayActivity.find((a) => a.userId === member.userId)}
                isMe={member.userId === currentUserId}
              />
            ))}
          </div>
        </div>

        {/* Invite */}
        <div>
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mb-3">
            Invite someone
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              placeholder="their@email.com"
              className="input-base flex-1"
            />
            <button
              type="button"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="px-4 py-2 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-sm rounded-xl disabled:opacity-40 hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors shrink-0"
            >
              {inviteSent ? '✓ Sent' : inviting ? '...' : 'Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
