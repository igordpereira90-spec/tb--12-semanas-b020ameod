import pb from '@/lib/pocketbase/client'

export interface AppUser {
  id: string
  name: string
  email: string
  avatar: string
  role: 'patient' | 'professional'
  points: number
  badges: unknown
  consent_accepted: boolean
  consent_date: string | null
  age: number | null
  created: string
  updated: string
}

export interface PatientListItem {
  id: string
  name: string
  email?: string
}

/**
 * Lista leve de pacientes para dropdowns e seletores (apenas id, name, email).
 */
export async function getPatientsList(): Promise<PatientListItem[]> {
  try {
    const list = await pb.collection('users').getFullList<PatientListItem>({
      filter: 'role = "patient"',
      sort: 'name',
      fields: 'id,name,email',
    })
    return list
  } catch (err: any) {
    console.error('[users service] getPatientsList() FAILED:', err)
    throw err
  }
}

export async function getPatients() {
  console.log(
    '[users service] getPatients() called. authStore.isValid:',
    pb.authStore.isValid,
    'token:',
    pb.authStore.token ? `${pb.authStore.token.slice(0, 10)}...` : 'NONE',
    'user:',
    pb.authStore.record?.id,
  )
  try {
    const list = await pb.collection('users').getFullList<AppUser>({
      filter: 'role = "patient"',
      sort: 'name',
    })
    console.log('[users service] getPatients() SUCCESS, count:', list.length)
    return list
  } catch (err: any) {
    console.error('[users service] getPatients() FAILED:', err, {
      status: err?.status,
      message: err?.message,
      data: err?.data,
      isAbort: err?.isAbort,
    })
    throw err
  }
}

export async function getUser(id: string) {
  return pb.collection('users').getOne<AppUser>(id)
}
