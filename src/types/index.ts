// Tipe data utama untuk Villa Sadulur

export type Role = 'guest' | 'owner' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  phone?: string
  avatar?: string
}

export interface Villa {
  id: number
  name: string
  description: string
  location: string
  price: number
  priceWeekend?: number
  capacity: number
  bedrooms?: number
  bathrooms?: number
  facilities: string[]
  images: string[]
  whatsapp?: string
  available: boolean
  rating?: number
  reviews_count?: number
  latitude?: number
  longitude?: number
  owner_id?: string | number
  owner?: User
  createdAt?: string
  updatedAt?: string
}

export interface Booking {
  id: string | number
  villa_id: string | number
  villa?: Villa
  user_id?: string | number
  user?: User
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'unpaid' | 'paid' | 'refunded'
  notes?: string
  created_at?: string
}

export interface Review {
  id: string | number
  villa_id: string | number
  user?: User
  rating: number
  comment: string
  created_at?: string
}

export interface ApiResponse<T> {
  status: string
  data: T
  message?: string
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

export interface VillaFilters {
  search?: string
  min_price?: number
  max_price?: number
  capacity?: number
  location?: string
  check_in?: string
  check_out?: string
}
