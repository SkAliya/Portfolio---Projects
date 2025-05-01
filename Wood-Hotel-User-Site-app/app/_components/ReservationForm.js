"use client";

import Image from "next/image";
import { useReservationContext } from "./ReservationContext";
import { differenceInDays } from "date-fns";
import Button from "./Button";
import { createBooking } from "../_lib/actions";

function ReservationForm({ cabin, session }) {
  // CHANGE
  // const maxCapacity = 23;
  const { maxCapacity, id: cabinId, regularPrice, discount } = cabin;
  const { dates, resetDates } = useReservationContext();

  const startDate = dates.from;
  const endDate = dates.to;

  const numNights = differenceInDays(dates.to, dates.from);
  const cabinPrice = (regularPrice - discount) * numNights;

  const newData = {
    startDate,
    endDate,
    numNights,
    cabinPrice,
    cabinId,
  };

  const createBookingWithNewData = createBooking.bind(null, newData);

  return (
    <div className="scale-[1.00]">
      {/* <p>
        {dates?.from?.toString()}
        {dates?.to?.toString()}
      </p> */}
      <div className="bg-primary-800 text-primary-300 px-16 py-2 flex justify-between items-center">
        <p>Logged in as</p>

        {session?.user?.image && (
          <div className="flex gap-4 items-center">
            <img
              // Important to display google profile images
              referrerPolicy="no-referrer"
              className="h-8 rounded-full"
              src={session.user.image}
              alt={session.user.name}
            />
            <p>{session.user.name}</p>
          </div>
        )}
      </div>

      <form
        action={async (formData) => {
          // await createBooking(formData);
          await createBookingWithNewData(formData);
          resetDates();
        }}
        className="bg-primary-900 py-10 px-16 text-lg flex gap-5 flex-col min-h-96


        "
      >
        <div className="space-y-2">
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            id="observations"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            placeholder="Any pets, allergies, special requirements, etc.?"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          {!(startDate && endDate) ? (
            <p className="text-primary-300 text-base">
              Start by selecting dates
            </p>
          ) : (
            <Button btnText="Reserve now" />
          )}
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;
