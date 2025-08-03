import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { GetServerSidePropsContext } from 'next';
import type { Database } from '@/types/database';

export const createSupabaseServerClient = (context: GetServerSidePropsContext) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return context.req.cookies[name];
        },
        set: (name: string, value: string, options: CookieOptions) => {
          context.res.setHeader('Set-Cookie', (context.res.getHeader('Set-Cookie') as string[] || []).concat(
            `${name}=${value}; Path=${options.path}; Max-Age=${options.maxAge}; HttpOnly; Secure`
          ));
        },
        remove: (name: string, options: CookieOptions) => {
          context.res.setHeader('Set-Cookie', (context.res.getHeader('Set-Cookie') as string[] || []).concat(
            `${name}=; Path=${options.path}; Max-Age=0; HttpOnly; Secure`
          ));
        },
      },
    }
  );
};