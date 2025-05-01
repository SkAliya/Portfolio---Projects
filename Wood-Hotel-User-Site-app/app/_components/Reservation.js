import { auth } from "../_lib/auth";
import { getBookedDatesByCabinId, getSettings } from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

async function Reservation({ cabin }) {
  // const bookedDates = await getBookedDatesByCabinId(cabin.id);
  // const settings = await getSettings();
  const [bookedDates, settings] = await Promise.all([
    getBookedDatesByCabinId(cabin.id),
    getSettings(),
  ]);
  const session = await auth();
  return (
    // <div className="grid grid-cols-2 border border-primary-800 min-h-[400px]">
    <div className="grid grid-cols-[auto_auto] border border-primary-800 min-h-[100px]">
      <DateSelector
        bookedDates={bookedDates}
        settings={settings}
        cabin={cabin}
      />
      {session?.user ? (
        <ReservationForm cabin={cabin} session={session} />
      ) : (
        <LoginMessage />
      )}
    </div>
  );
}

export default Reservation;
