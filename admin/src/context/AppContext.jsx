import { createContext } from "react";
import validator from 'validator'

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currency = "EGP";
  const calculateAge = (dob) => {
    if (!dob || !validator.isDate(dob)) {
      return "Unknown"; // Return a string to avoid NaN
    }
    const today = new Date();
    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) {
      return "Unknown"; // Handle invalid date
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString(); // Ensure age is a string
  };
  const months = [
    "",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
    );
  };
  const value = { calculateAge, slotDateFormat, currency };
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
