const validatePassword = (password) => {
  if (!password) {
    return "Password is required.";
  } else if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  } else if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  } else if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  } else if (!/[0-9]/.test(password)) {
    return "Password must contain at least one digit.";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return null;
};

export default validatePassword;
