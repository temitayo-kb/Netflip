import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import "./Login.css";
import logo from "../../assets/Netflip_logo.png";
import { login, signup } from "../../firebase";
import netflix_spinner from "../../assets/netflix_spinner.gif";

const Login = () => {
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setProfilesDirectly } = useProfile();

  const user_auth = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (signState === "Sign In") {
        const result = await login(email, password);
        if (result.success) {
          navigate("/profiles");
        }
      } else {
        const result = await signup(name, email, password);

        if (result.success && result.profiles) {
          // Set profiles in context
          setProfilesDirectly(result.profiles);

          // Wait for state to fully propagate
          await new Promise((resolve) => setTimeout(resolve, 150));

          navigate("/profiles");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="login-spinner">
      <img src={netflix_spinner} alt="" />
    </div>
  ) : (
    <div className="login">
      <img src={logo} className="login-logo" alt="" />
      <div className="login-form">
        <h1>{signState}</h1>
        <form>
          {signState === "Sign Up" ? (
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              type="text"
              placeholder="Your name"
            />
          ) : (
            <></>
          )}
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            type="email"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            placeholder="Password"
          />
          <button onClick={user_auth} type="submit">
            {signState}
          </button>
          <div className="form-help">
            <div className="remember">
              <input type="checkbox" />
              <label htmlFor="">Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <div className="form-switch">
          {signState === "Sign In" ? (
            <p>
              New to Netflip?
              <span
                onClick={() => {
                  setSignState("Sign Up");
                }}
              >
                Sign up now
              </span>
            </p>
          ) : (
            <p>
              Already have an account?
              <span
                onClick={() => {
                  setSignState("Sign In");
                }}
              >
                Sign in now
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
