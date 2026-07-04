import pb from '@/lib/pocketbase/client'

export interface EducationalMaterial {
  id: string
  week_number: number
  title: string
  objective: string
  content: string
  created: string
  updated: string
}

export async function getEducationalMaterials() {
  return pb.collection('educational_materials').getFullList<EducationalMaterial>({
    sort: 'week_number',
  })
}

export async function updateEducationalMaterial(id: string, data: Partial<EducationalMaterial>) {
  return pb.collection('educational_materials').update<EducationalMaterial>(id, data)
}
