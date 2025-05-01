import CabinCard from "@/app/_components/CabinCard";
import { getCabins } from "@/app/_lib/data-service";
import { unstable_noStore as noStore } from "next/cache";

// now here we implement server compont level cahing stops caching storing opts out uncache data fetching makes it dynamic again which is static makes by use using suspense wrapping
// to stop caching we use unstable_noStore from next/cache
// nd stop the cahing by revalidating in page.js while we r uncahing data making dynamic
async function CabinsList({ filter }) {
  noStore();
  const cabins = await getCabins();

  let filteredCabins;

  if (filter === "all") {
    filteredCabins = cabins;
  }
  if (filter === "small") {
    filteredCabins = cabins.filter((cabin) => cabin.maxCapacity <= 3);
  }
  if (filter === "medium") {
    filteredCabins = cabins.filter(
      (cabin) => cabin.maxCapacity >= 4 && cabin.maxCapacity <= 7
    );
  }
  if (filter === "large") {
    filteredCabins = cabins.filter((cabin) => cabin.maxCapacity >= 8);
  }

  return (
    cabins.length > 0 && (
      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
        {filteredCabins.map((cabin) => (
          <CabinCard cabin={cabin} key={cabin.id} />
        ))}
      </div>
    )
  );
}

export default CabinsList;
