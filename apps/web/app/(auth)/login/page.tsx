import { AuthLoginPage } from "@/components/auth-login-page";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
    email?: string;
  }>;
};

export default function LoginPage(props: LoginPageProps) {
  return <AuthLoginPage {...props} />;
}
