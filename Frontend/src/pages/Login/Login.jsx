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
          <span className="badge" style={{ background: "rgba(255,255,255,0.12)", color: "#fff7ef" }}>
            Sindhu Agencies
          </span>
          <h1>Operate stock, orders, and dispatch without the daily scramble.</h1>
          <p>
            This rebuild moves the portal to a secure cookie-based sign-in flow with a proper operations
            dashboard for products, customers, agencies, and order tracking.
          </p>
        </div>
      </section>

      <section className="auth-card-wrap">
        <form className="auth-card panel" onSubmit={handleSubmit(onSubmit)}>
          <h2>Sign in</h2>
          <p>Use your admin email or registered phone credentials.</p>

          <div className="stack">
            <Input
              label="Email or phone"
              placeholder="example@gmail.com"
              error={errors.identifier?.message}
              {...register("identifier", { required: "Email or phone is required" })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              error={errors.password?.message}
              {...register("password", { required: "Password is required" })}
            />
            <Button type="submit" loading={isSubmitting}>
              Continue to dashboard
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
