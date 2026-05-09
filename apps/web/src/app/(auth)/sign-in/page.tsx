import { AuthPanel } from '@/components/AuthPanel';

export const metadata = { title: 'Sign in' };

export default function SignInPage() {
  return <AuthPanel mode="sign-in" />;
}
