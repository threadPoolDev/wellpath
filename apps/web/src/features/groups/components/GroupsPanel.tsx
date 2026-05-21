import { useEffect, useRef, useState } from 'react'
import { groupsApi, Group, GroupInvite } from '../api'
import { useNavStore } from '@/store/navStore'
import { useAuthStore } from '@/store/authStore'
import { GroupList } from './GroupList'
import { GroupDetail } from './GroupDetail'
import { cn } from '@/lib/utils'

type EmailStatus = 'idle' | 'checking' | 'found' | 'not_found' | 'invalid'

interface InvitedEmail {
  email: string
  name: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function CreateGroupForm({ onCreated, onBack }: { onCreated: (g: Group) => void; onBack: () => void }) {
  const [name, setName] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [foundName, setFoundName] = useState('')
  const [invited, setInvited] = useState<InvitedEmail[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const email = emailInput.trim()

    if (!email) { setEmailStatus('idle'); setFoundName(''); return }
    if (!EMAIL_RE.test(email)) { setEmailStatus('invalid'); setFoundName(''); return }
    if (invited.some((i) => i.email === email)) { setEmailStatus('idle'); return }

    setEmailStatus('checking')
    setFoundName('')

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await groupsApi.checkEmail(email)
        if (result.exists) {
          setEmailStatus('found')
          setFoundName(result.name ?? '')
        } else {
          setEmailStatus('not_found')
        }
      } catch {
        setEmailStatus('idle')
      }
    }, 400)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [emailInput, invited])

  function addEmail() {
    if (emailStatus !== 'found') return
    const email = emailInput.trim()
    setInvited((prev) => [...prev, { email, name: foundName }])
    setEmailInput('')
    setEmailStatus('idle')
    setFoundName('')
  }

  async function handleCreate() {
    if (!name.trim()) return
    setIsCreating(true)
    try {
      const group = await groupsApi.createGroup(name.trim(), invited.map((i) => i.email))
      onCreated(group)
    } catch (err) {
      console.error('[groups] create failed:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const statusHint =
    emailStatus === 'checking' ? (
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5 flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 border-2 border-stone-300 border-t-stone-500 rounded-full animate-spin" />
        Checking...
      </p>
    ) : emailStatus === 'found' ? (
      <p className="text-xs text-sage-600 dark:text-sage-400 mt-1.5 text-green-600 dark:text-green-400">
        ✓ {foundName} is on WellPath — press Add or Enter
      </p>
    ) : emailStatus === 'not_found' ? (
      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
        This email isn't registered on WellPath yet.
      </p>
    ) : emailStatus === 'invalid' && emailInput.trim() ? (
      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1.5">Enter a valid email address.</p>
    ) : null

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-700 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="flex-1 text-lg font-semibold text-stone-800 dark:text-stone-100">Create a group</h2>
      </div>

      <div className="flex-1 p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1">Group name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work crew, Morning club..."
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-600 dark:text-stone-300 mb-1">
            Invite people <span className="text-stone-400 dark:text-stone-500 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEmail()}
              placeholder="their@email.com"
              className={cn(
                'input-base flex-1',
                emailStatus === 'found' && 'border-green-400 dark:border-green-600 focus:ring-green-300',
                emailStatus === 'not_found' && 'border-red-300 dark:border-red-700 focus:ring-red-200'
              )}
            />
            <button
              type="button"
              onClick={addEmail}
              disabled={emailStatus !== 'found'}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>

          {statusHint}

          {invited.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {invited.map((i) => (
                <span key={i.email} className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 text-green-800 dark:text-green-300 text-sm px-3 py-1 rounded-full">
                  <span className="font-medium">{i.name}</span>
                  <span className="text-green-500 dark:text-green-600 text-xs">{i.email}</span>
                  <button
                    type="button"
                    onClick={() => setInvited((prev) => prev.filter((x) => x.email !== i.email))}
                    className="text-green-400 dark:text-green-600 hover:text-green-600 dark:hover:text-green-300 leading-none ml-0.5"
                    aria-label={`Remove ${i.email}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={!name.trim() || isCreating}
          className="w-full py-3 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create group'}
        </button>
      </div>
    </div>
  )
}

export function GroupsPanel() {
  const [groups, setGroups] = useState<Group[]>([])
  const [invites, setInvites] = useState<GroupInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const activeGroupId = useNavStore((s) => s.activeGroupId)
  const setActiveGroup = useNavStore((s) => s.setActiveGroup)
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

  function handleGroupCreated(group: Group) {
    setGroups((prev) => [...prev, group])
    setActiveGroup(group._id)
    setShowCreate(false)
  }

  function handleLeft() {
    setGroups((prev) => prev.filter((g) => g._id !== activeGroupId))
    setActiveGroup(null)
  }

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r border-stone-100 dark:border-stone-700 p-3 space-y-2 shrink-0">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-14 bg-stone-100 dark:bg-stone-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-stone-100 dark:bg-stone-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  // On mobile/tablet, the right panel (detail or create) takes full screen when active
  const rightPanelActive = showCreate || activeGroupId !== null

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left column — group list */}
      {/* Hidden on mobile/tablet when right panel is active; always visible on lg+ */}
      <div
        className={cn(
          'flex-col border-r border-stone-100 dark:border-stone-700 shrink-0 lg:flex lg:w-64',
          rightPanelActive ? 'hidden' : 'flex w-full'
        )}
      >
        <GroupList
          groups={groups}
          invites={invites}
          activeGroupId={activeGroupId}
          onSelectGroup={(id) => { setShowCreate(false); setActiveGroup(id) }}
          onCreateGroup={() => { setActiveGroup(null); setShowCreate(true) }}
          onAcceptInvite={handleAccept}
          onDeclineInvite={handleDecline}
        />
      </div>

      {/* Right column — detail / create / empty state */}
      {/* Hidden on mobile/tablet unless right panel is active; always visible on lg+ */}
      <div
        className={cn(
          'flex-col flex-1 overflow-hidden lg:flex',
          rightPanelActive ? 'flex' : 'hidden'
        )}
      >
        {showCreate ? (
          <CreateGroupForm onCreated={handleGroupCreated} onBack={() => setShowCreate(false)} />
        ) : activeGroupId ? (
          <GroupDetail
            key={activeGroupId}
            groupId={activeGroupId}
            currentUserId={currentUser?.id ?? ''}
            onBack={() => setActiveGroup(null)}
            onLeft={handleLeft}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-stone-400 dark:text-stone-500 text-sm">Select a group to see their progress</p>
          </div>
        )}
      </div>
    </div>
  )
}
