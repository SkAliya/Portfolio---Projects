import Link from "next/link";
import { Suspense } from "react";
import Spinner from "@/app/_components/Spinner";
import CabinsList from "./CabinsList";
import Filter from "@/app/_components/Filter";
import ReservationReminder from "@/app/_components/ReservationReminder";

// export const revalidate = 0;
// this revalidate may be ur choice of seconds but guud staletym is per hr or per min to refetch catch the databest practices for 1hr min 60*60 =3600  for 1min=60 this is for route level cahing
// for now caching per 2secs
// export const revalidate = 2;
// export const revalidate = 15;
// export const revalidate = 3600;
export const metadata = {
  title: "Cabins",
};
export default function Page({ searchParams }) {
  // CHANGE
  // const cabins = [];
  // console.log("start fetching.....");
  // const cabins = await getCabins();
  // console.log(cabins);
  const filter = searchParams.capacity ?? "all";

  return (
    <div>
      <h1 className="text-4xl mb-5 text-accent-400 font-medium">
        Our Luxury Cabins
      </h1>
      <p className="text-primary-200 text-lg mb-10">
        Cozy yet luxurious cabins, located right in the heart of the Italian
        Dolomites. Imagine waking up to beautiful mountain views, spending your
        days exploring the dark forests around, or just relaxing in your private
        hot tub under the stars. Enjoy nature&apos;s beauty in your own little
        home away from home. The perfect spot for a peaceful, calm vacation.
        Welcome to paradise.
      </p>
      <div className="flex mb-8 justify-end">
        <Filter filter={filter} />
      </div>
      <Suspense fallback={<Spinner />} key={filter}>
        <CabinsList filter={filter} />
        <ReservationReminder />
      </Suspense>
    </div>
  );
}
