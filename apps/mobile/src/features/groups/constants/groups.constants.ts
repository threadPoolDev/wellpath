export const GROUPS_QUERY_KEYS = {
  LIST: 'groupsList',
  DETAIL: 'groupDetail',
  INVITES: 'groupInvites',
} as const

export const GROUPS_STRINGS = {
  TITLE: 'Groups',
  NO_GROUPS: 'No groups yet',
  NO_GROUPS_SUBTEXT: 'Create a group and invite people who help keep you accountable.',
  CREATE_GROUP: 'Create a group',
  CREATE_TITLE_LABEL: 'Group name',
  CREATE_TITLE_PLACEHOLDER: 'Morning crew, family, work team…',
  INVITE_EMAILS_LABEL: 'Invite people (optional)',
  INVITE_EMAILS_PLACEHOLDER: 'email@example.com',
  INVITE_ADD: 'Add',
  INVITE_LABEL: 'Invite someone',
  INVITE_EMAIL_PLACEHOLDER: 'Enter their email',
  LEAVE_CONFIRM: 'Leave group?',
  LEAVE_CONFIRM_SUBTEXT: "You can always come back — just ask a member to invite you again.",
  LEAVE_CANCEL: 'Stay',
  LEAVE_CONFIRM_CTA: 'Leave',
  MEMBERS_LABEL: 'Members',
  ACTIVITY_TODAY: "Today's activity",
  NO_ACTIVITY: 'No activity yet today',
  PENDING_INVITES: 'You have pending invites',
  ACCEPT: 'Accept',
  DECLINE: 'Decline',
  COMPLETION_PCT: (n: number) => `${n}% done today`,
} as const

export const SHARING_LABELS: Record<string, string> = {
  completion_only: 'Completion only',
  with_task_detail: 'With task details',
  with_reasons: 'With reasons',
  nothing: 'Invisible',
}

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  member: 'Member',
}
