import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DesignPageClient } from './DesignPageClient'

// Server component — fetches user plan then renders the client component
export default async function DesignPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const userPlan = profile?.plan ?? 'free';

  return <DesignPageClient userPlan={userPlan} />;
}
