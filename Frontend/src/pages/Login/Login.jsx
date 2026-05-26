import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth.js";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (values) => {
    try {
      const payload = values.identifier.includes("@")
        ? { email: values.identifier, password: values.password }
        : { phone: values.identifier, password: values.password };
      await login(payload);
      toast.success("Signed in successfully");
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in");
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <div className="auth-brand">
          <h1>Sindhu Agencies</h1>
          <p>
            Your all-in-one portal to manage inventory, customer orders, dispatch scheduling,
            and agency operations — from a single secure dashboard.
          </p>
          <ul className="auth-features">
            <li>📦 Real-time stock & product management</li>
            <li>🚚 Order tracking & dispatch coordination</li>
            <li>🤝 Customer & agency relationship tools</li>
          </ul>
        </div>
      </section>

      <section className="auth-card-wrap">
        <form className="auth-card panel" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-card-header">
            
            <div>
              <h2>Welcome back</h2>
              <p>Sign in to your Sindhu Agencies account</p>
            </div>
          </div>

          <div className="stack">
            <Input
              label="Email or phone"
              placeholder="you@example.com or 9XXXXXXXXX"
              error={errors.identifier?.message}
              {...register("identifier", { required: "Email or phone is required" })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />
            <Button type="submit" loading={isSubmitting}>
              Sign in to Dashboard
            </Button>
          </div>

          <p className="auth-footer-note">
            For access or support, contact your Sindhu Agencies administrator.
          </p>
        </form>
      </section>
    </div>
  );
}
