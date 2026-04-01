// Tipe data utama untuk Villa Sadulur

export type Role = 'visitor' | 'guest' | 'owner' | 'admin'

export interface User {
  id: string | number
  name: string
  email: string
  role: Role
  phone?: string
  avatar?: string
  createdAt?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone?: string
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
  slug?: string
  lat?: number
  lng?: number
  latitude?: number
  longitude?: number
  owner_id?: string | number
  owner?: User
  createdAt?: string
  updatedAt?: string
}

export interface Booking {
  id: string | number
  bookingCode?: string
  villa_slug?: string
  villa_id?: string | number
  villa?: Villa
  user_id?: string | number
  user?: User
  customerName: string
  customerPhone: string
  customerEmail?: string
  villaName?: string
  villaLocation?: string
  villaPrice?: number
  checkInDate?: string
  checkOutDate?: string
  bookingDate?: string
  numberOfGuests?: number
  totalPrice?: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'paid'
  createdAt?: string
  updatedAt?: string
}

export interface PaginatedResponse<T> {
  status: string
  data: T[]
  total?: number
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message?: string
}

export interface Review {
  id: string | number
  villa_id: string | number
  villa?: { id: string | number; name: string; location: string }
  user_id?: string | number
  reviewer?: { id: string | number; name: string; email: string; phone?: string }
  user?: User
  rating: number
  comment: string
  created_at?: string
  createdAt?: string
}

export interface Payment {
  id: string | number
  booking_id: string | number
  booking?: Booking
  amount: number
  method?: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_url?: string
  snap_token?: string
  proof_url?: string
  paid_at?: string
  created_at?: string
}

export interface ChatMessage {
  id: string | number
  chat_id: string | number
  sender_id: string | number
  sender?: User
  message: string
  created_at?: string
}

export interface Chat {
  id: string | number
  villa_id?: string | number
  villa?: Villa
  participants?: User[]
  last_message?: ChatMessage
  messages?: ChatMessage[]
  created_at?: string
}

export interface Testimonial {
  id: number
  name: string
  position?: string
  message: string
  rating: number
  photo?: string
  is_active: boolean
  sort_order: number
  createdAt?: string
}

export interface Article {
  id: number
  title: string
  slug: string
  content?: string
  excerpt?: string
  cover_image?: string
  author_id?: number
  author?: { id: number; name: string }
  status: 'published' | 'draft'
  published_at?: string
  createdAt?: string
}

export interface Faq {
  id: number
  question: string
  answer: string
  category: string
  order_index: number
  is_active: boolean
  createdAt?: string
}

export interface SupportMessage {
  id: number
  ticket_id: number
  sender_id?: number
  sender_name: string
  sender_role: 'user' | 'admin'
  message: string
  is_internal: boolean
  createdAt: string
}

export interface SupportTicket {
  id?: number
  ticket_code: string
  user_id?: number
  name: string
  email: string
  subject: string
  category: 'booking' | 'payment' | 'villa' | 'other'
  priority: 'low' | 'medium' | 'high'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: number
  resolved_at?: string
  requester?: { id: number; name: string; email: string }
  handler?: { id: number; name: string }
  messages?: SupportMessage[]
  createdAt?: string
}

export interface LiveChatMessage {
  id: number
  session_id: number
  sender_type: 'visitor' | 'bot' | 'admin'
  sender_id?: number
  message: string
  intent?: string
  createdAt: string
}

export interface LiveChatSession {
  id: number
  session_token: string
  user_id?: number
  visitor_name?: string
  visitor_email?: string
  status: 'bot' | 'waiting' | 'active' | 'closed'
  admin_id?: number
  assignedAdmin?: { id: number; name: string }
  ended_at?: string
  messages?: LiveChatMessage[]
  createdAt?: string
}

export interface BotKnowledge {
  id: number
  intent: string
  keywords: string
  response: string
  order_index: number
  is_active: boolean
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
  lat?: number
  lng?: number
  radius?: number
}
