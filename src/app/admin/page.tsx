import { redirect } from 'next/navigation'

/* La racine de la console renvoie vers la vue d'ensemble. */
export default function AdminPage() {
  redirect('/admin/overview')
}
