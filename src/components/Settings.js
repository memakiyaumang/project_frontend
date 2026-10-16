import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Bell,
  Lock,
  Palette,
  Save,
  LogOut,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../css/Settings.css";

const API_BASE_URL = "https://project-backend-1sgz.onrender.com";

const Settings = () => {
  const navigate = useNavigate();

  // =========================================
  // GET LOGGED-IN STUDENT
  // =========================================

  const getLoggedInUser = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("studentSession") || "null"
      );
    } catch (error) {
      return null;
    }
  };

  const getUserName = (user) => {
    if (!user) return "";

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.userName ||
      ""
    );
  };

  const getUserEmail = (user) => {
    if (!user) return "";

    return user.email || user.emailAddress || "";
  };

  // =========================================
  // GET JWT TOKEN
  // =========================================

  const getToken = () => {
    const studentSession = getLoggedInUser();

    if (studentSession?.token) {
      return studentSession.token;
    }

    const studentToken =
      localStorage.getItem("studentToken");

    if (studentToken) {
      return studentToken;
    }

    return null;
  };

  // =========================================
  // AUTH HEADERS
  // =========================================

  const getAuthHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // =========================================
  // HANDLE UNAUTHORIZED
  // =========================================

  const handleUnauthorized = () => {
    sessionStorage.removeItem("studentSession");
    sessionStorage.removeItem("studentQuizResult");

    localStorage.removeItem("studentToken");

    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // USER STATE
  // =========================================

  const [loggedInUser, setLoggedInUser] = useState(
    getLoggedInUser()
  );

  const [name, setName] = useState(
    getUserName(getLoggedInUser())
  );

  const [email, setEmail] = useState(
    getUserEmail(getLoggedInUser())
  );

  // =========================================
  // VALIDATION ERRORS
  // =========================================

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  // =========================================
  // SAVE / API ERROR
  // =========================================

  const [saveError, setSaveError] = useState("");

  // =========================================
  // SAVE LOADING
  // =========================================

  const [isSaving, setIsSaving] = useState(false);

  // =========================================
  // NOTIFICATIONS
  // =========================================

  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    newCourses: true,
    emailNotifications: false,
  });

  // =========================================
  // APPEARANCE
  // =========================================

  const [appearance, setAppearance] = useState(
    localStorage.getItem("appearance") || "light"
  );

  // =========================================
  // SUCCESS MESSAGE
  // =========================================

  const [showSuccess, setShowSuccess] = useState(false);

  // =========================================
  // APPLY THEME
  // =========================================

  const applyTheme = (theme) => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    document.body.setAttribute(
      "data-theme",
      theme
    );
  };

  // =========================================
  // LOAD USER + SETTINGS
  // =========================================

  useEffect(() => {
    const user = getLoggedInUser();

    setLoggedInUser(user);
    setName(getUserName(user));
    setEmail(getUserEmail(user));

    // =========================================
    // LOAD SAVED SETTINGS
    // =========================================

    let savedSettings = null;

    try {
      savedSettings = JSON.parse(
        localStorage.getItem("userSettings") || "null"
      );
    } catch (error) {
      savedSettings = null;
    }

    if (savedSettings) {
      setNotifications(
        savedSettings.notifications || {
          courseUpdates: true,
          newCourses: true,
          emailNotifications: false,
        }
      );

      if (savedSettings.appearance) {
        setAppearance(
          savedSettings.appearance
        );
      }
    }

    const savedAppearance =
      savedSettings?.appearance ||
      localStorage.getItem("appearance") ||
      "light";

    applyTheme(savedAppearance);
  }, []);

  // =========================================
  // APPLY THEME WHEN APPEARANCE CHANGES
  // =========================================

  useEffect(() => {
    applyTheme(appearance);
  }, [appearance]);

  // =========================================
  // LISTEN FOR LOGIN CHANGES
  // =========================================

  useEffect(() => {
    const handleUserChange = () => {
      const user = getLoggedInUser();

      setLoggedInUser(user);
      setName(getUserName(user));
      setEmail(getUserEmail(user));
    };

    window.addEventListener(
      "userLoginChanged",
      handleUserChange
    );

    window.addEventListener(
      "storage",
      handleUserChange
    );

    return () => {
      window.removeEventListener(
        "userLoginChanged",
        handleUserChange
      );

      window.removeEventListener(
        "storage",
        handleUserChange
      );
    };
  }, []);

  // =========================================
  // GENERATE INITIALS
  // =========================================

  const getInitials = (userName) => {
    if (!userName) return "ST";

    const words = userName
      .trim()
      .split(/\s+/);

    if (words.length >= 2) {
      return (
        words[0][0] +
        words[words.length - 1][0]
      ).toUpperCase();
    }

    return userName
      .substring(0, 2)
      .toUpperCase();
  };

  // =========================================
  // VALIDATE NAME
  // =========================================

  const validateName = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Full name is required.";
    }

    if (trimmedValue.length < 2) {
      return "Full name must be at least 2 characters.";
    }

    return "";
  };

  // =========================================
  // VALIDATE EMAIL
  // =========================================

  const validateEmail = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Email address is required.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedValue
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // =========================================
  // NAME CHANGE
  // =========================================

  const handleNameChange = (event) => {
    const value = event.target.value;

    setName(value);
    setNameError(validateName(value));
    setSaveError("");
    setShowSuccess(false);
  };

  // =========================================
  // EMAIL CHANGE
  // =========================================

  const handleEmailChange = (event) => {
    const value = event.target.value;

    setEmail(value);
    setEmailError(validateEmail(value));
    setSaveError("");
    setShowSuccess(false);
  };

  // =========================================
  // SAVE CHANGES
  // =========================================

  const handleSave = async () => {
    const currentUser = getLoggedInUser();

    if (!currentUser) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    // =========================================
    // RESET ERRORS
    // =========================================

    setNameError("");
    setEmailError("");
    setSaveError("");
    setShowSuccess(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // =========================================
    // VALIDATION
    // =========================================

    const currentNameError =
      validateName(trimmedName);

    const currentEmailError =
      validateEmail(trimmedEmail);

    if (currentNameError) {
      setNameError(currentNameError);
    }

    if (currentEmailError) {
      setEmailError(currentEmailError);
    }

    if (
      currentNameError ||
      currentEmailError
    ) {
      return;
    }

    // =========================================
    // GET USER ID
    // =========================================

    const currentUserId =
      currentUser.id ||
      currentUser._id ||
      currentUser.userId;

    if (!currentUserId) {
      setSaveError(
        "Unable to identify your account. Please login again."
      );

      return;
    }

    // =========================================
    // CHECK JWT
    // =========================================

    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    // =========================================
    // START SAVING
    // =========================================

    setIsSaving(true);

    try {
      // =========================================
      // UPDATE USER THROUGH BACKEND
      // =========================================

      const response = await fetch(
        `${API_BASE_URL}/api/update-user/${currentUserId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: trimmedName,
            fullName: trimmedName,
            email: trimmedEmail,
          }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch (error) {
        result = {};
      }

      // =========================================
      // TOKEN ERROR
      // =========================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleUnauthorized();
        return;
      }

      // =========================================
      // BACKEND ERROR
      // =========================================

      if (!response.ok) {
        setSaveError(
          result?.message ||
            "Unable to update your profile. Please try again."
        );

        return;
      }

      // =========================================
      // GET UPDATED USER DATA
      // =========================================

      const backendUser =
        result?.data ||
        result?.user ||
        result?.updatedUser ||
        {};

      // =========================================
      // UPDATE SESSION
      // =========================================

      const updatedUser = {
        ...currentUser,

        ...backendUser,

        id:
          backendUser.id ||
          backendUser._id ||
          currentUser.id ||
          currentUser._id,

        name:
          backendUser.name ||
          backendUser.fullName ||
          trimmedName,

        fullName:
          backendUser.fullName ||
          backendUser.name ||
          trimmedName,

        email:
          backendUser.email ||
          trimmedEmail,

        role:
          backendUser.role ||
          currentUser.role ||
          "student",

        status:
          backendUser.status ||
          currentUser.status ||
          "approved",

        // Keep existing JWT
        token:
          currentUser.token ||
          token,
      };

      sessionStorage.setItem(
        "studentSession",
        JSON.stringify(updatedUser)
      );

      // =========================================
      // UPDATE REACT STATE
      // =========================================

      setLoggedInUser(updatedUser);

      setName(
        updatedUser.name ||
          updatedUser.fullName ||
          trimmedName
      );

      setEmail(
        updatedUser.email ||
          trimmedEmail
      );

      // =========================================
      // SAVE LOCAL SETTINGS
      // =========================================

      const settings = {
        notifications,
        appearance,
      };

      localStorage.setItem(
        "userSettings",
        JSON.stringify(settings)
      );

      // =========================================
      // SAVE APPEARANCE
      // =========================================

      localStorage.setItem(
        "appearance",
        appearance
      );

      // =========================================
      // APPLY THEME
      // =========================================

      applyTheme(appearance);

      // =========================================
      // NOTIFY HEADER + SIDEBAR
      // =========================================

      window.dispatchEvent(
        new Event("userLoginChanged")
      );

      // =========================================
      // SUCCESS
      // =========================================

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Settings update error:",
        error
      );

      setSaveError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    // Remove student session
    sessionStorage.removeItem(
      "studentSession"
    );

    // Remove stored student JWT
    localStorage.removeItem(
      "studentToken"
    );

    // Update Header / Sidebar
    window.dispatchEvent(
      new Event("userLoginChanged")
    );

    // Reset appearance
    localStorage.removeItem(
      "appearance"
    );

    document.documentElement.setAttribute(
      "data-theme",
      "light"
    );

    document.body.setAttribute(
      "data-theme",
      "light"
    );

    // Go to login
    navigate("/login", {
      replace: true,
    });
  };

  // =========================================
  // USER ROLE
  // =========================================

  const userRole = "Student";

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="settings-page">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="settings-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account preferences and settings.
          </p>

        </div>

        <div className="settings-header-icon">

          <Lock size={22} />

        </div>

      </div>

      {/* =====================================
          SUCCESS MESSAGE
      ====================================== */}

      {showSuccess && (
        <div className="settings-success">

          <CheckCircle size={17} />

          <span>
            Settings saved successfully.
          </span>

        </div>
      )}

      {/* =====================================
          SAVE ERROR
      ====================================== */}

      {saveError && (
        <div
          style={{
            marginBottom: "16px",
            padding: "11px 14px",
            borderRadius: "8px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "13px",
          }}
        >
          {saveError}
        </div>
      )}

      {/* =====================================
          PROFILE
      ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon purple">

            <User size={18} />

          </div>

          <div>

            <h2>
              Profile Information
            </h2>

            <p>
              Update your personal account information.
            </p>

          </div>

        </div>

        {/* Profile Preview */}

        <div className="profile-preview">

          <div className="settings-avatar">

            {getInitials(name)}

          </div>

          <div>

            <h3>
              {name || "Student"}
            </h3>

            <span>
              {userRole}
            </span>

          </div>

        </div>

        {/* Form */}

        <div className="settings-form-grid">

          {/* Full Name */}

          <div className="settings-field">

            <label htmlFor="settings-name">
              Full Name
            </label>

            <div
              className="settings-input-wrapper"
              style={
                nameError
                  ? {
                      borderColor: "#ef4444",
                    }
                  : {}
              }
            >

              <User size={15} />

              <input
                type="text"
                id="settings-name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
              />

            </div>

            {nameError && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#ef4444",
                  fontSize: "12px",
                }}
              >
                {nameError}
              </span>
            )}

          </div>

          {/* Email */}

          <div className="settings-field">

            <label htmlFor="settings-email">
              Email Address
            </label>

            <div
              className="settings-input-wrapper"
              style={
                emailError
                  ? {
                      borderColor: "#ef4444",
                    }
                  : {}
              }
            >

              <Mail size={15} />

              <input
                type="email"
                id="settings-email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
              />

            </div>

            {emailError && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#ef4444",
                  fontSize: "12px",
                }}
              >
                {emailError}
              </span>
            )}

          </div>

        </div>

      </section>

      {/* =====================================
          NOTIFICATIONS
      ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon blue">

            <Bell size={18} />

          </div>

          <div>

            <h2>
              Notifications
            </h2>

            <p>
              Choose which notifications you want to receive.
            </p>

          </div>

        </div>

        <div className="settings-options">

          {/* Course Updates */}

          <div className="settings-option">

            <div>

              <strong>
                Course Updates
              </strong>

              <span>
                Receive updates about your enrolled courses.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  notifications.courseUpdates
                }
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    courseUpdates:
                      e.target.checked,
                  })
                }
              />

              <span className="toggle-slider"></span>

            </label>

          </div>

          {/* New Courses */}

          <div className="settings-option">

            <div>

              <strong>
                New Courses
              </strong>

              <span>
                Get notified when new courses are available.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  notifications.newCourses
                }
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    newCourses:
                      e.target.checked,
                  })
                }
              />

              <span className="toggle-slider"></span>

            </label>

          </div>

          {/* Email Notifications */}

          <div className="settings-option">

            <div>

              <strong>
                Email Notifications
              </strong>

              <span>
                Receive important notifications by email.
              </span>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={
                  notifications.emailNotifications
                }
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    emailNotifications:
                      e.target.checked,
                  })
                }
              />

              <span className="toggle-slider"></span>

            </label>

          </div>

        </div>

      </section>

      {/* =====================================
          APPEARANCE
      ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon orange">

            <Palette size={18} />

          </div>

          <div>

            <h2>
              Appearance
            </h2>

            <p>
              Choose how the platform looks for you.
            </p>

          </div>

        </div>

        <div className="appearance-options">

          {/* Light */}

          <button
            type="button"
            className={`appearance-option ${
              appearance === "light"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setAppearance("light")
            }
          >

            <div className="appearance-preview light-preview">

              <div></div>

              <span></span>

              <span></span>

            </div>

            <strong>
              Light
            </strong>

            {appearance === "light" && (
              <CheckCircle size={16} />
            )}

          </button>

          {/* Dark */}

          <button
            type="button"
            className={`appearance-option ${
              appearance === "dark"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setAppearance("dark")
            }
          >

            <div className="appearance-preview dark-preview">

              <div></div>

              <span></span>

              <span></span>

            </div>

            <strong>
              Dark
            </strong>

            {appearance === "dark" && (
              <CheckCircle size={16} />
            )}

          </button>

        </div>

      </section>

      {/* =====================================
          PRIVACY & SECURITY
      ====================================== */}

      <section className="settings-card">

        <div className="settings-card-header">

          <div className="settings-section-icon green">

            <Shield size={18} />

          </div>

          <div>

            <h2>
              Privacy & Security
            </h2>

            <p>
              Manage your account security preferences.
            </p>

          </div>

        </div>

        <div className="security-row">

          <div>

            <strong>
              Password
            </strong>

            <span>
              Keep your account secure with a strong password.
            </span>

          </div>

          <button
            type="button"
            className="secondary-settings-button"
            onClick={() =>
              alert(
                "Change password feature coming soon."
              )
            }
          >
            Change Password
          </button>

        </div>

      </section>

      {/* =====================================
          BOTTOM ACTIONS
      ====================================== */}

      <div className="settings-actions">

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >

          <LogOut size={15} />

          Logout

        </button>

        <button
          type="button"
          className="save-settings-button"
          onClick={handleSave}
          disabled={isSaving}
          style={
            isSaving
              ? {
                  opacity: 0.7,
                  cursor: "not-allowed",
                }
              : {}
          }
        >

          <Save size={15} />

          {isSaving
            ? "Saving..."
            : "Save Changes"}

        </button>

      </div>

    </div>
  );
};

export default Settings;