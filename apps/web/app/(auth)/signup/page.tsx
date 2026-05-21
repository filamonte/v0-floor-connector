import { AuthSignupPage } from "@/components/auth-signup-page";

type SignupPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
    email?: string;
  }>;
};

export default function SignupPage(props: SignupPageProps) {
  return <AuthSignupPage {...props} />;
}
