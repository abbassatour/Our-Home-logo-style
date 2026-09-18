// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // جلب المستخدم والتحقق من صحة وصلاحية الجلسة
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. حماية مسارات الإدارة: إذا لم يكن المستخدم مسجلاً، وجهه لصفحة الدخول
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)

    // نسخ الكوكيز المحدثة إلى كائن التوجيه لمنع ضياع الجلسة
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    return redirectResponse
  }

  // 2. إذا كان الأدمن مسجل الدخول بالفعل وحاول فتح صفحة /login، وجهه للوحة المشاريع مباشرة
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/projects'
    const redirectResponse = NextResponse.redirect(url)

    // نسخ الكوكيز أيضاً
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })

    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}