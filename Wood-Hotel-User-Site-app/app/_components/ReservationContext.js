"use client";

import { createContext, useContext, useState } from "react";

const ReservationContext = createContext();

const initialState = { from: undefined, to: undefined };
function ReservationProvider({ children }) {
  const [dates, setDates] = useState(initialState);
  const resetDates = () => setDates(initialState);
  console.log(dates);

  return (
    <ReservationContext.Provider
      value={{
        dates,
        setDates,
        resetDates,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

function useReservationContext() {
  const context = useContext(ReservationContext);
  if (context === undefined)
    throw new Error("Reservation context is used outside the provider!");
  return context;
}

export { ReservationProvider, useReservationContext };
