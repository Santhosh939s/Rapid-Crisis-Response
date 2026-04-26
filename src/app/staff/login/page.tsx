import LoginForm from "@/components/LoginForm";

export default function StaffLogin() {
  return <LoginForm role="Staff" redirectPath="/staff/dashboard" />;
}
