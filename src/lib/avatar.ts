export function getAvatarUrl(user: { id: string; avatar?: string } | null | undefined): string {
  if (!user) {
    return 'https://img.usecurling.com/ppl/thumbnail?seed=default'
  }
  if (user.avatar) {
    return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${user.id}/${user.avatar}`
  }
  return `https://img.usecurling.com/ppl/thumbnail?seed=${encodeURIComponent(user.id)}`
}
