'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Redirect to villas page — add is handled via modal there
export default function OwnerVillasAddRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/dashboard/owner/villas') }, [router])
  return null
}
